#!/usr/bin/env python3
"""
scripts/generate_data.py
Generates synthetic Indian court order sheets for "Ramaiah vs Neighbour" (O.S. 142/2015)
- 60 hearings spanning ~9 years (~3,285 days)
- Realistic court language (mixed English and typical Indian court vernacular)
- Categories: court_side, extension_sought, witness_absent, lawyer_absent,
              summons_not_served, documents_pending, productive
- 9 productive hearings, 51 adjournments
- Also generates a 40-sample labelled test set for scripts/evaluate.py
"""

import json
import os
import random
from datetime import datetime, timedelta

# Avoidable flag by litigant/counsel (court_side is NOT avoidable by litigant)
AVOIDABLE_BY_LITIGANT = {
    "court_side": False,
    "extension_sought": True,
    "witness_absent": True,
    "lawyer_absent": True,
    "summons_not_served": True,
    "documents_pending": True,
    "productive": False,
    "unclear": False
}

CATEGORY_DESCRIPTIONS = {
    "court_side": "Judge on leave, administrative vacancy, general advocates boycott / strike, or court holiday",
    "extension_sought": "Litigant or counsel requested additional time to file written statement, counter, or rejoinder",
    "witness_absent": "Witness (PW/DW) failed to attend or filed medical memo postponing cross-examination",
    "lawyer_absent": "Advocate absent or engaged in another court; no representation on call",
    "summons_not_served": "Process fee/batta not paid, summons returned unserved, or fresh dasti summons ordered",
    "documents_pending": "Revenue patta passbook, survey sketch, certified copies, or Advocate Commissioner report pending",
    "productive": "Hearing made substantive procedural progress (issues framed, witness examined/cross-examined, arguments heard)"
}

ORDER_TEMPLATES = {
    "court_side": [
        "Case called. Presiding Officer is on casual leave. All matters posted for today stand adjourned en bloc as per official bench notification. Call on {next_date}.",
        "Case called out. Advocates are abstaining from court work pursuant to Bar Association resolution regarding local bifurcation issue. No judicial work transacted. Reposted to {next_date}.",
        "Court sits late due to administrative inspection by Hon'ble Principal District Judge. Time not reached for hearing civil board. Roll adjourned to {next_date}.",
        "Presiding Officer transferred. Bench vacant. In-charge Court only taking up remand and urgent stay matters. Civil matters adjourned en bloc. Post on {next_date}.",
        "Case called. Due to sudden declaration of local holiday on account of general municipal elections, court work suspended. Re-listed on {next_date}."
    ],
    "summons_not_served": [
        "Case called. Plaintiff present with Sri K. Ramaiah's counsel. Summons sent to Defendant No. 2 returned unserved with postal endorsement 'addressee not found / left without intimation'. Plaintiff directed to take fresh steps and pay batta along with correct address within seven days. Call on {next_date}.",
        "Plaintiff absent. Counsel present. Notice sent to Defendant No. 3 not yet returned. Service status awaited from Nazir branch. Steps not taken for publication. Issue fresh summons through Court and RPAD on payment of process. For service report, adjourned to {next_date}.",
        "Case called. Sri [REDACTED], counsel for Plaintiff. Process memo not filed. No batta paid for issuing summons to newly impleaded legal heirs of Defendant No. 1. Last chance granted to deposit process fee. Call on {next_date}.",
        "Summons returned with endorsement that door was locked on multiple visits. Plaintiff counsel seeks permission for substituted service by affixture at the disputed survey plot No. 74/B. Permitted on deposit of charges. Post on {next_date}."
    ],
    "extension_sought": [
        "Case called. Counsel for Defendant No. 1 filed memo seeking adjournment of three weeks for filing Written Statement and counter to interim injunction application. Plaintiff counsel vehemently opposes delay citing status quo violation. As a last opportunity on payment of costs of Rs. 300 to DLSA, adjourned to {next_date}.",
        "Matter listed for filing replication and verification by Plaintiff. Sri Ramaiah's counsel submits that original certified pahani copies are awaited from Tahsildar office, seeks time. Granted. For rejoinder finally, post on {next_date}.",
        "Case called out. Both parties present through advocates. Defendant counsel seeks short accommodation to verify survey boundaries and file additional documents. Adjourned as last chance to {next_date}.",
        "Listed for objections to Advocate Commissioner's preliminary spot inspection report. Counsel for Plaintiff filed memo praying for two weeks time to file detailed survey objections. Time granted. Call on {next_date}."
    ],
    "lawyer_absent": [
        "Case called. Plaintiff present in person. Sri [REDACTED], learned counsel for Plaintiff is absent. No representation made when matter called twice. Counsel for Defendant ready. In the interest of justice, adjourned to {next_date}.",
        "Case called out. Junior colleague of Defendant's counsel mentions that senior counsel is held up before the Hon'ble High Court at Amaravati in a part-heard writ appeal. Prays pass-over. Matter taken up at 3:30 PM, senior counsel still unavailable. Adjourned to {next_date}.",
        "Both parties present. Learned counsel for Defendant filed sick memo stating acute fever and indisposition. Opposed by opposite counsel. Adjournment granted on humanitarian grounds. Call on {next_date}.",
        "Case called. Neither Plaintiff nor his counsel present. No memo filed. Matter passed over till 2:15 PM. At 2:15 PM, junior counsel appeared and reported inability to proceed today. Adjourned to {next_date}."
    ],
    "witness_absent": [
        "Case listed for cross-examination of P.W.1. Plaintiff Ramaiah absent. Learned counsel filed memo stating witness is suffering from severe arthritis and unable to travel from village. Defendant counsel ready with brief. For cross of PW1 conditionally, adjourned to {next_date}.",
        "Case called. Listed for further chief examination of D.W.2 (Village Revenue Officer). Summons served on D.W.2, but witness called absent without any intimation or leave letter. Issue bailable warrant of Rs. 1,000 to D.W.2 through SHO. Call on {next_date}.",
        "Plaintiff witness P.W.2 (Surveyor) not in attendance. Memo filed stating witness had family emergency. Cross-examination deferred. Defendant counsel complains of repeated delay. Adjourned as final chance to {next_date}.",
        "Case called. Listed for defense evidence. Defendant D.W.1 called absent. Medical certificate produced showing viral infection. One last opportunity granted for D.W.1 evidence. Adjourned to {next_date}."
    ],
    "documents_pending": [
        "Case called. Listed for marking original registered sale deed dated 14-06-1982. Plaintiff counsel submits document is pending with District Registrar for stamp duty deficit adjudication. Production memo filed. For document production, call on {next_date}.",
        "Matter posted for Advocate Commissioner report. Warrant of commission returned unexecuted by Court Commissioner reporting that Mandal Surveyor did not attend on the fixed date with field measurement book (FMB). Commissioner re-entrusted with commission work. Report by {next_date}.",
        "Case called. Both counsel present. Translation of Telugu land partition deed (Palu-pampu Patram) into English not yet submitted into record. Registry raised scrutiny objection. For filing typed translation copy, adjourned to {next_date}.",
        "Listed for marking secondary evidence. Learned counsel for Defendant seeks production of certified copy of Encumbrance Certificate from Sub-Registrar Office, Sangareddy. Sub-Registrar summoned records not yet received. Await records, post on {next_date}."
    ],
    "productive": [
        "Case called. Both parties present with respective advocates. Sri K. Ramaiah (P.W.1) present in box. Chief examination conducted. Ex.A-1 (Registered Sale Deed No. 1922/1984), Ex.A-2 (Pahani extract for fasli 1420), Ex.A-3 to A-7 marked. Cross-examination deferred at request of defense counsel to {next_date}.",
        "Case called. P.W.1 present in box. Cross-examination of P.W.1 conducted in full by learned counsel for Defendant No. 1 and Defendant No. 2 running into 6 folios. P.W.1 discharged. Evidence of P.W.1 closed. For evidence of P.W.2, call on {next_date}.",
        "Case called. Both sides present. Pleadings perused. Issues framed under Order XIV Rule 1 CPC regarding title, adverse possession, and boundary demarcation. List of documents verified. For Plaintiff evidence, adjourned to {next_date}.",
        "Case called. D.W.1 (Defendant) present. Cross-examination of D.W.1 conducted in part. Material admissions extracted regarding northern boundary wall. Further cross-examination scheduled to {next_date}.",
        "Case called. Advocate Commissioner Sri M. Venkat Rao present and filed spot inspection report along with field measurement sketch and survey photographs. Report taken on file. Marked as Ex.C-1 and C-2. For filing objections if any by parties, call on {next_date}.",
        "Case called. Both parties and respective counsel present. Arguments of Sri [REDACTED], learned counsel for Plaintiff heard extensively on Ex.A-1 to A-9 and question of limitation. For defense counsel arguments, adjourned to {next_date}.",
        "Case called out. Both sides present. Heard final arguments of learned counsel for Defendants. Written notes of argument submitted along with Supreme Court citations on agricultural easement rights. For judgment / orders, post to {next_date}."
    ]
}

def generate_case_hearings():
    """Generates 60 hearings over ~9 years (~3,285 days) for Ramaiah vs Neighbour"""
    random.seed(42)
    start_date = datetime(2015, 2, 10)
    
    predefined_categories = [
        # 1-10: Summons and initial pleadings
        "summons_not_served", "summons_not_served", "extension_sought", "summons_not_served",
        "extension_sought", "lawyer_absent", "extension_sought", "documents_pending",
        "productive", # Order 9: Issues framed!
        "extension_sought",
        
        # 11-20: Pre-trial and Plaintiff evidence begins
        "court_side", "documents_pending", "lawyer_absent", "witness_absent",
        "productive", # Order 15: PW1 chief examined, Ex.A1-A7 marked
        "lawyer_absent", "witness_absent", "court_side", "witness_absent", "extension_sought",
        
        # 21-30: PW1 cross and Commissioner appointment
        "productive", # Order 21: PW1 cross-examined & discharged
        "witness_absent", "court_side", "lawyer_absent", "documents_pending",
        "productive", # Order 26: PW2 examined
        "extension_sought", "documents_pending", "court_side", "lawyer_absent",
        
        # 31-40: Advocate Commissioner inspection & objections
        "documents_pending", "documents_pending",
        "productive", # Order 33: Commissioner report filed & marked Ex.C1-C2
        "extension_sought", "court_side", "extension_sought", "lawyer_absent", "witness_absent",
        "documents_pending", "court_side",
        
        # 41-50: Defense Evidence
        "witness_absent", "lawyer_absent",
        "productive", # Order 43: DW1 chief examined
        "witness_absent", "court_side", "witness_absent", "lawyer_absent",
        "productive", # Order 48: DW1 cross-examined
        "extension_sought", "court_side",
        
        # 51-60: Final Arguments stage
        "witness_absent", "documents_pending", "lawyer_absent", "court_side",
        "productive", # Order 55: Plaintiff arguments heard
        "extension_sought", "lawyer_absent", "court_side",
        "productive", # Order 59: Defense arguments completed & written submissions filed
        "court_side"   # Order 60: Post-argument listing
    ]
    
    hearings = []
    current_date = start_date
    total_listings = 60
    
    assert len(predefined_categories) == 60
    assert predefined_categories.count("productive") == 9
    
    intervals = []
    for cat in predefined_categories[:-1]:
        if cat == "court_side":
            intervals.append(random.randint(45, 90))
        elif cat == "summons_not_served":
            intervals.append(random.randint(35, 70))
        elif cat == "documents_pending":
            intervals.append(random.randint(40, 80))
        elif cat == "witness_absent":
            intervals.append(random.randint(30, 65))
        elif cat == "lawyer_absent":
            intervals.append(random.randint(25, 55))
        elif cat == "extension_sought":
            intervals.append(random.randint(28, 60))
        else: # productive
            intervals.append(random.randint(30, 65))
            
    scale = 3285.0 / sum(intervals)
    intervals = [max(21, int(round(i * scale))) for i in intervals]
    
    for i in range(total_listings):
        order_no = i + 1
        cat = predefined_categories[i]
        date_str = current_date.strftime("%Y-%m-%d")
        
        days_to_next = intervals[i] if i < total_listings - 1 else 45
        next_date = current_date + timedelta(days=days_to_next)
        next_date_str = next_date.strftime("%d.%m.%Y")
        
        template = random.choice(ORDER_TEMPLATES[cat])
        text = template.format(next_date=next_date_str)
        
        if cat == "court_side":
            if "casual leave" in text:
                snippet = "Presiding Officer is on casual leave"
            elif "abstaining from court work" in text:
                snippet = "Advocates are abstaining from court work pursuant to Bar Association resolution"
            elif "inspection" in text:
                snippet = "Court sits late due to administrative inspection"
            elif "transferred" in text:
                snippet = "Presiding Officer transferred. Bench vacant"
            else:
                snippet = "declaration of local holiday on account of general municipal elections"
            reason = "Judicial bench vacancy, leave, or advocate bar strike"
        elif cat == "summons_not_served":
            if "returned unserved" in text:
                snippet = "Summons sent to Defendant No. 2 returned unserved"
            elif "not yet returned" in text:
                snippet = "Notice sent to Defendant No. 3 not yet returned"
            elif "process memo not filed" in text.lower():
                snippet = "Process memo not filed. No batta paid"
            else:
                snippet = "Summons returned with endorsement that door was locked"
            reason = "Summons unserved / batta process fee not paid"
        elif cat == "extension_sought":
            if "Written Statement" in text:
                snippet = "memo seeking adjournment of three weeks for filing Written Statement"
            elif "pahani" in text:
                snippet = "original certified pahani copies are awaited from Tahsildar office, seeks time"
            elif "verify survey" in text:
                snippet = "seeks short accommodation to verify survey boundaries"
            else:
                snippet = "praying for two weeks time to file detailed survey objections"
            reason = "Time sought for filing written statement, rejoinder, or objections"
        elif cat == "lawyer_absent":
            if "High Court" in text:
                snippet = "senior counsel is held up before the Hon'ble High Court"
            elif "sick memo" in text:
                snippet = "learned counsel for Defendant filed sick memo stating acute fever"
            elif "absent. No representation" in text:
                snippet = "learned counsel for Plaintiff is absent. No representation"
            else:
                snippet = "junior counsel appeared and reported inability to proceed today"
            reason = "Counsel absent, indisposed, or engaged in superior court"
        elif cat == "witness_absent":
            if "severe arthritis" in text:
                snippet = "witness is suffering from severe arthritis and unable to travel"
            elif "bailable warrant" in text:
                snippet = "D.W.2 called absent without any intimation or leave letter"
            elif "family emergency" in text:
                snippet = "Plaintiff witness P.W.2 (Surveyor) not in attendance"
            else:
                snippet = "Medical certificate produced showing viral infection"
            reason = "Material witness absent or filed medical memo"
        elif cat == "documents_pending":
            if "deficit" in text:
                snippet = "document is pending with District Registrar for stamp duty deficit"
            elif "Commissioner" in text:
                snippet = "Warrant of commission returned unexecuted by Court Commissioner"
            elif "translation" in text.lower():
                snippet = "Translation of Telugu land partition deed into English not yet submitted"
            else:
                snippet = "Sub-Registrar summoned records not yet received"
            reason = "Official documents, FMB survey records, or translation pending"
        else: # productive
            if "Chief examination conducted" in text:
                snippet = "Chief examination conducted. Ex.A-1 ... Ex.A-3 to A-7 marked"
            elif "Cross-examination of P.W.1" in text:
                snippet = "Cross-examination of P.W.1 conducted in full"
            elif "Issues framed" in text:
                snippet = "Issues framed under Order XIV Rule 1 CPC"
            elif "D.W.1 present" in text:
                snippet = "Cross-examination of D.W.1 conducted in part"
            elif "Advocate Commissioner" in text:
                snippet = "Advocate Commissioner Sri M. Venkat Rao present and filed spot inspection report"
            elif "Arguments of Sri" in text:
                snippet = "Arguments of Sri [REDACTED], learned counsel for Plaintiff heard extensively"
            else:
                snippet = "Heard final arguments of learned counsel for Defendants"
            reason = "Substantive procedural hearing conducted"
            
        hearings.append({
            "order_no": order_no,
            "date": date_str,
            "order_sheet_text": text,
            "days_to_next_hearing": days_to_next,
            "ground_truth_category": cat,
            "ground_truth_reason": reason,
            "ground_truth_snippet": snippet,
            "is_avoidable_by_litigant": AVOIDABLE_BY_LITIGANT[cat]
        })
        
        current_date = next_date

    return hearings

def generate_test_dataset(n=40):
    """Generates 40 distinct labelled order sheets for scripts/evaluate.py"""
    random.seed(999)
    test_hearings = []
    
    categories = [
        "court_side", "extension_sought", "witness_absent", "lawyer_absent",
        "summons_not_served", "documents_pending", "productive"
    ]
    
    for i in range(n):
        cat = categories[i % len(categories)]
        order_no = 101 + i
        date_obj = datetime(2023, 1, 1) + timedelta(days=i * 20)
        date_str = date_obj.strftime("%Y-%m-%d")
        next_date_str = (date_obj + timedelta(days=random.randint(21, 60))).strftime("%d.%m.%Y")
        
        template = random.choice(ORDER_TEMPLATES[cat])
        text = template.format(next_date=next_date_str)
        
        test_hearings.append({
            "order_no": order_no,
            "date": date_str,
            "order_sheet_text": text,
            "ground_truth_category": cat,
            "is_avoidable_by_litigant": AVOIDABLE_BY_LITIGANT[cat]
        })
        
    return test_hearings

def main():
    os.makedirs("/data", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # 1. Generate 60-hearing benchmark case
    case_hearings = generate_case_hearings()
    total_days = sum(h["days_to_next_hearing"] for h in case_hearings[:-1])
    productive_count = sum(1 for h in case_hearings if h["ground_truth_category"] == "productive")
    avoidable_days = sum(h["days_to_next_hearing"] for h in case_hearings[:-1] if h["is_avoidable_by_litigant"])
    
    case_data = {
        "case_metadata": {
            "title": "K. Ramaiah vs M. Venkat Reddy & Ors (Neighbour)",
            "case_number": "O.S. No. 142 of 2015",
            "court": "Court of Junior Civil Judge, Sangareddy",
            "suit_type": "Original Suit for Declaration of Title, Perpetual Injunction & Boundary Demarcation",
            "total_listings": len(case_hearings),
            "start_date": case_hearings[0]["date"],
            "end_date": case_hearings[-1]["date"],
            "total_duration_days": total_days,
            "productive_hearings": productive_count,
            "friction_days": total_days - sum(h["days_to_next_hearing"] for h in case_hearings[:-1] if h["ground_truth_category"] == "productive"),
            "avoidable_friction_days": avoidable_days,
            "is_synthetic": True,
            "label": "Synthetic example (O.S. 142/2015 Land Boundary Dispute)"
        },
        "hearings": case_hearings
    }
    
    for path in ["data/ramaiah_vs_neighbour.json", "/data/ramaiah_vs_neighbour.json"]:
        try:
            with open(path, "w") as f:
                json.dump(case_data, f, indent=2)
        except Exception:
            pass
            
    print(f"Generated {len(case_hearings)} hearings in data/ramaiah_vs_neighbour.json")
    print(f"Total span: {total_days} days (~{total_days / 365.25:.1f} years), Productive: {productive_count}")
    
    # 2. Generate 40-hearing evaluation test set
    test_hearings = generate_test_dataset(40)
    for path in ["data/test_order_sheets.json", "/data/test_order_sheets.json"]:
        try:
            with open(path, "w") as f:
                json.dump(test_hearings, f, indent=2)
        except Exception:
            pass
    print(f"Generated {len(test_hearings)} labelled test orders in data/test_order_sheets.json")

if __name__ == "__main__":
    main()

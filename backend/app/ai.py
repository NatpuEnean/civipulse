from sentence_transformers import SentenceTransformer, util

# ======================================================
# Multilingual semantic model (EN + TA + HI)
# ======================================================

model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# ======================================================
# Civic department reference phrases
# ======================================================

CATEGORIES = {
    "Electricity Board": [
        "street light not working",
        "power cut",
        "electricity problem"
    ],
    "Municipality": [
        "garbage not collected",
        "drainage problem",
        "sewage overflow",
        "waste issue"
    ],
    "Roads Department": [
        "pothole",
        "road damage",
        "traffic signal not working"
    ],
    "Water Board": [
        "water leakage",
        "no water supply",
        "pipeline broken"
    ],
    "Public Safety": [
        "danger",
        "accident risk",
        "unsafe area",
        "school zone danger"
    ]
}

NON_PUBLIC_TOPICS = [
    "movie",
    "relationship",
    "exam",
    "salary",
    "personal issue",
    "company problem"
]

# Precompute embeddings
CATEGORY_EMB = {
    dept: model.encode(texts, convert_to_tensor=True)
    for dept, texts in CATEGORIES.items()
}
NON_PUBLIC_EMB = model.encode(NON_PUBLIC_TOPICS, convert_to_tensor=True)


# ======================================================
# AI Analysis
# ======================================================

def analyze_issue(text: str, nearby: dict):
    """
    nearby example:
    {
        "schools": 1,
        "hospitals": 0,
        "residential": 1
    }
    """

    emb = model.encode(text, convert_to_tensor=True)

    # ---------- Public vs Non-public ----------
    non_public_score = util.cos_sim(emb, NON_PUBLIC_EMB).max().item()
    if non_public_score > 0.55:
        return {
            "notPublicIssue": True,
            "confidence": round(non_public_score, 2)
        }

    # ---------- Department Detection ----------
    best_dept = "General Administration"
    best_score = 0.0

    for dept, refs in CATEGORY_EMB.items():
        score = util.cos_sim(emb, refs).max().item()
        if score > best_score:
            best_score = score
            best_dept = dept

    # ---------- Danger / Priority ----------
    danger_refs = model.encode(
        ["danger", "emergency", "risk", "accident", "unsafe"],
        convert_to_tensor=True
    )
    danger_score = util.cos_sim(emb, danger_refs).max().item()

    nearby_score = (
        nearby.get("schools", 0)
        + nearby.get("hospitals", 0) * 2
        + nearby.get("residential", 0)
    )

    final_score = danger_score + nearby_score * 0.3

    if final_score > 1.2:
        priority = "High"
    elif final_score > 0.7:
        priority = "Medium"
    else:
        priority = "Low"

    confidence = round(min(1.0, (best_score + danger_score) / 2), 2)

    return {
        "notPublicIssue": False,
        "department": best_dept,
        "priority": priority,
        "confidence": confidence
    }

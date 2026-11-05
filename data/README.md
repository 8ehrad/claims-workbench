# Synthetic demonstration data

Every person, policy, claim and supporting document is fictional. Amounts are US dollars. These are illustrative travel insurance rules, not a real insurer's policy wording.

`claims.json`, `policies.json`, `customers.json` and `handlers.json` seed the operational records. The security fixture adds a claim containing a prompt injection. Only Dana has senior approval rights. `company.json` supplies the initial approval threshold; `improvement.json` and `models.json` configure evaluations and permitted model changes.

`context/` owns the product's policy wording, claims manual, plans and reference definitions. The document copies here remain as seed regression fixtures.

`evals/` contains handler labels and held-out claims, used only for seeding and scoring. Do not pass these labels to claim agents or use held-out answers while designing instructions. Evaluation copies stay outside the queue and cannot receive a human sign-off.

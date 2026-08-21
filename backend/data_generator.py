import json
import random
import os
from datetime import datetime, timedelta, timezone
from config import NUM_SYNTHETIC_RECORDS, RANDOM_SEED, FAILURE_CODE_DISTRIBUTION, MANDATE_TYPES, DATASET_PATH

def generate_synthetic_dataset(num_records=NUM_SYNTHETIC_RECORDS, seed=RANDOM_SEED, save_to_file=True):
    """
    Generates realistic, reproducible synthetic failed recurring payment records.
    Fixed random seed ensures identical dataset output across demo runs.
    """
    random.seed(seed)
    
    failure_codes = list(FAILURE_CODE_DISTRIBUTION.keys())
    failure_weights = list(FAILURE_CODE_DISTRIBUTION.values())
    
    amounts = [299, 499, 799, 999, 1499, 1999, 2999, 4999, 7999, 9999, 14999]
    amount_weights = [0.15, 0.20, 0.15, 0.20, 0.10, 0.08, 0.05, 0.04, 0.01, 0.01, 0.01]
    
    history_flags = ["reliable", "occasional_late", "repeated_decline_pattern"]
    history_weights = [0.65, 0.25, 0.10]
    
    # Attempt numbers (0 to 4 weighted towards lower attempt counts)
    attempt_choices = [0, 1, 2, 3, 4]
    attempt_weights = [0.45, 0.30, 0.15, 0.07, 0.03]
    
    now = datetime.now(timezone.utc)
    dataset = []
    
    # Generate ~40 distinct customer IDs for realism (multiple payments per customer)
    customer_pool = [f"cust_{100 + i}" for i in range(45)]
    customer_history_map = {cid: random.choices(history_flags, weights=history_weights)[0] for cid in customer_pool}
    customer_tenure_map = {cid: random.randint(15, 730) for cid in customer_pool}
    
    for i in range(1, num_records + 1):
        payment_id = f"pay_rec_{i:03d}"
        customer_id = random.choice(customer_pool)
        
        mandate_type = random.choice(MANDATE_TYPES)
        failure_code = random.choices(failure_codes, weights=failure_weights)[0]
        amount = random.choices(amounts, weights=amount_weights)[0]
        attempt_number = random.choices(attempt_choices, weights=attempt_weights)[0]
        
        customer_tenure_days = customer_tenure_map[customer_id]
        customer_payment_history_flag = customer_history_map[customer_id]
        
        # Override history flag for hard declines/blocked cards to simulate realistic risk patterns
        if failure_code in ["card_blocked", "repeated_hard_decline"] and random.random() < 0.7:
            customer_payment_history_flag = "repeated_decline_pattern"
            
        # Failed timestamp within the last 7 days
        hours_ago = random.randint(1, 168)
        failed_at = (now - timedelta(hours=hours_ago)).isoformat()
        
        # Days since last customer message sent (for rate limiting test)
        days_since_last_message = random.choice([None, 1, 3, 5, 8, 12, 20])
        
        record = {
            "payment_id": payment_id,
            "customer_id": customer_id,
            "amount": amount,
            "mandate_type": mandate_type,
            "failure_code": failure_code,
            "attempt_number": attempt_number,
            "customer_tenure_days": customer_tenure_days,
            "customer_payment_history_flag": customer_payment_history_flag,
            "failed_at": failed_at,
            "days_since_last_message": days_since_last_message
        }
        dataset.append(record)
        
    if save_to_file:
        dir_path = os.path.dirname(DATASET_PATH)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)
        with open(DATASET_PATH, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2)
            
    return dataset

def load_or_create_dataset():
    """Loads existing synthetic dataset file or generates a fresh one if missing."""
    if os.path.exists(DATASET_PATH):
        try:
            with open(DATASET_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return generate_synthetic_dataset(save_to_file=True)

if __name__ == "__main__":
    data = generate_synthetic_dataset()
    print(f"Generated {len(data)} synthetic failed payment records saved to {DATASET_PATH}.")

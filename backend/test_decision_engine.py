import unittest
from decision_engine import decide_recovery_action

class TestDecisionEngine(unittest.TestCase):

    def test_hard_stop_max_attempts(self):
        payment_record = {
            "payment_id": "pay_test_01",
            "attempt_number": 4,
            "amount": 2499
        }
        root_cause_info = {"root_cause": "insufficient_funds"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "stop_and_flag")
        self.assertIn("Maximum attempt limit reached", result["stopping_rule_triggered"])

    def test_hard_stop_risk_override(self):
        payment_record = {
            "payment_id": "pay_test_02",
            "attempt_number": 1,
            "amount": 5000
        }
        root_cause_info = {"root_cause": "insufficient_funds"}
        risk_info = {"verdict": "stop_and_flag", "reasoning": "High decline velocity"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "stop_and_flag")
        self.assertIn("Gemini Verdict = stop_and_flag", result["stopping_rule_triggered"])

    def test_hard_stop_messaging_rate_limit(self):
        payment_record = {
            "payment_id": "pay_test_03",
            "attempt_number": 1,
            "amount": 1999,
            "days_since_last_message": 3
        }
        root_cause_info = {"root_cause": "expired_card"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "escalate_human_followup")
        self.assertIn("Rate Limit Triggered", result["stopping_rule_triggered"])

    def test_expired_card_action(self):
        payment_record = {
            "payment_id": "pay_test_04",
            "attempt_number": 1,
            "amount": 2999
        }
        root_cause_info = {"root_cause": "expired_card"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "send_card_update_link")
        self.assertIsNone(result["retry_delay_days"])

    def test_insufficient_funds_attempt_1(self):
        payment_record = {
            "payment_id": "pay_test_05",
            "attempt_number": 1,
            "amount": 1499
        }
        root_cause_info = {"root_cause": "insufficient_funds"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "retry_scheduled")
        self.assertEqual(result["retry_delay_days"], 3)

    def test_insufficient_funds_attempt_2(self):
        payment_record = {
            "payment_id": "pay_test_06",
            "attempt_number": 2,
            "amount": 1499
        }
        root_cause_info = {"root_cause": "insufficient_funds"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "send_card_update_link")

    def test_bank_technical_error_immediate(self):
        payment_record = {
            "payment_id": "pay_test_07",
            "attempt_number": 0,
            "amount": 999
        }
        root_cause_info = {"root_cause": "technical_error"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "retry_immediate")
        self.assertEqual(result["retry_delay_days"], 0)

    def test_hard_decline_action(self):
        payment_record = {
            "payment_id": "pay_test_08",
            "attempt_number": 1,
            "amount": 4999
        }
        root_cause_info = {"root_cause": "hard_decline"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "stop_and_flag")

    def test_mandate_expired_action(self):
        payment_record = {
            "payment_id": "pay_test_09",
            "attempt_number": 1,
            "amount": 3499
        }
        root_cause_info = {"root_cause": "expired_mandate"}
        risk_info = {"verdict": "continue_recovery"}

        result = decide_recovery_action(payment_record, root_cause_info, risk_info)
        self.assertEqual(result["action"], "send_mandate_reauth_link")

if __name__ == "__main__":
    unittest.main()

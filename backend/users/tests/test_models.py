# backend/users/tests/test_models.py
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        u = User.objects.create_user(email="u@example.com", password="pass1234")
        self.assertTrue(u.check_password("pass1234"))
        self.assertEqual(u.email, "u@example.com")

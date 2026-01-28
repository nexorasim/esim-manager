#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class NexoraSIMAPITester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_msg = f"Status {response.status_code}"
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        error_msg += f": {error_data['error']}"
                except:
                    pass
                
                self.log_test(name, False, error_msg, expected_status, response.status_code)
                return {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return {}

    def test_health_check(self):
        """Test API health endpoint"""
        print("\n🔍 Testing Health Check...")
        response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        
        if response and 'status' in response:
            if response['status'] == 'OK':
                self.log_test("Health Status OK", True)
            else:
                self.log_test("Health Status OK", False, f"Status: {response['status']}")

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Generate unique test user
        timestamp = int(time.time())
        test_email = f"test_user_{timestamp}@nexorasim.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        
        response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            201,
            data={
                "email": test_email,
                "password": test_password,
                "name": test_name
            }
        )
        
        if response and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.test_email = test_email
            self.test_password = test_password
            self.log_test("Registration Token Received", True)
            self.log_test("User Data Received", True)
            
            # Verify user role is set to default 'viewer'
            if response['user']['role'] == 'viewer':
                self.log_test("Default Role Assignment", True)
            else:
                self.log_test("Default Role Assignment", False, f"Expected 'viewer', got '{response['user']['role']}'")
        else:
            self.log_test("Registration Response Format", False, "Missing token or user data")

    def test_duplicate_registration(self):
        """Test duplicate user registration should fail"""
        print("\n🔍 Testing Duplicate Registration...")
        
        if hasattr(self, 'test_email'):
            self.run_test(
                "Duplicate Registration Prevention",
                "POST",
                "api/auth/register",
                400,
                data={
                    "email": self.test_email,
                    "password": "AnotherPass123!",
                    "name": "Another User"
                }
            )

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if hasattr(self, 'test_email') and hasattr(self, 'test_password'):
            response = self.run_test(
                "User Login",
                "POST",
                "api/auth/login",
                200,
                data={
                    "email": self.test_email,
                    "password": self.test_password
                }
            )
            
            if response and 'token' in response:
                # Update token with login token
                self.token = response['token']
                self.log_test("Login Token Received", True)

    def test_invalid_login(self):
        """Test invalid login credentials"""
        print("\n🔍 Testing Invalid Login...")
        
        self.run_test(
            "Invalid Email Login",
            "POST",
            "api/auth/login",
            401,
            data={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        
        if hasattr(self, 'test_email'):
            self.run_test(
                "Invalid Password Login",
                "POST",
                "api/auth/login",
                401,
                data={
                    "email": self.test_email,
                    "password": "wrongpassword"
                }
            )

    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n🔍 Testing Get Current User...")
        
        if self.token:
            response = self.run_test(
                "Get Current User",
                "GET",
                "api/auth/me",
                200
            )
            
            if response and 'email' in response:
                self.log_test("User Profile Data", True)

    def test_profiles_endpoints(self):
        """Test profile-related endpoints"""
        print("\n🔍 Testing Profile Endpoints...")
        
        if not self.token:
            self.log_test("Profile Tests", False, "No authentication token available")
            return
        
        # Get profiles (should be empty initially)
        response = self.run_test(
            "Get User Profiles",
            "GET",
            "api/profiles",
            200
        )
        
        # Get profile stats
        self.run_test(
            "Get Profile Stats",
            "GET",
            "api/profiles/stats",
            200
        )
        
        # Test provision profile (should fail for viewer role)
        self.run_test(
            "Provision Profile (Viewer Role)",
            "POST",
            "api/profiles/provision",
            403,  # Should be forbidden for viewer role
            data={
                "activationCode": "TEST-ACTIVATION-CODE-123",
                "name": "Test Profile"
            }
        )

    def test_devices_endpoints(self):
        """Test device-related endpoints"""
        print("\n🔍 Testing Device Endpoints...")
        
        if not self.token:
            self.log_test("Device Tests", False, "No authentication token available")
            return
        
        # Get devices (should be empty initially)
        response = self.run_test(
            "Get User Devices",
            "GET",
            "api/devices",
            200
        )
        
        # Get device stats
        self.run_test(
            "Get Device Stats",
            "GET",
            "api/devices/stats",
            200
        )
        
        # Test add device (should fail for viewer role)
        self.run_test(
            "Add Device (Viewer Role)",
            "POST",
            "api/devices",
            403,  # Should be forbidden for viewer role
            data={
                "name": "Test Device",
                "eid": "TEST-EID-123456789",
                "connectionType": "wlan"
            }
        )

    def test_unauthorized_access(self):
        """Test endpoints without authentication"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        self.run_test(
            "Profiles Without Auth",
            "GET",
            "api/profiles",
            401
        )
        
        self.run_test(
            "Devices Without Auth",
            "GET",
            "api/devices",
            401
        )
        
        self.run_test(
            "Current User Without Auth",
            "GET",
            "api/auth/me",
            401
        )
        
        # Restore token
        self.token = original_token

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        print("\n🔍 Testing Dashboard Stats...")
        
        response = self.run_test(
            "Dashboard Stats",
            "GET",
            "api/stats",
            200
        )
        
        if response:
            expected_keys = ['profiles', 'devices', 'users']
            for key in expected_keys:
                if key in response:
                    self.log_test(f"Stats Contains {key.title()}", True)
                else:
                    self.log_test(f"Stats Contains {key.title()}", False, f"Missing {key} in response")

    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        print("\n🔍 Testing Invalid Endpoints...")
        
        self.run_test(
            "Invalid Endpoint",
            "GET",
            "api/nonexistent",
            404
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting NexoraSIM API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test sequence
        self.test_health_check()
        self.test_user_registration()
        self.test_duplicate_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_get_current_user()
        self.test_profiles_endpoints()
        self.test_devices_endpoints()
        self.test_unauthorized_access()
        self.test_dashboard_stats()
        self.test_invalid_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test function"""
    tester = NexoraSIMAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
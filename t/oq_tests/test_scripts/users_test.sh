#!/bin/bash
set -uo pipefail

USERS_TEST_SCRIPT_DIR=$(dirname "$(realpath "$0")")
source "${USERS_TEST_SCRIPT_DIR}/common.sh"

#===========================================================================================
# Create a new user using POST (without pre-setting the 'uid')
echo -e "\n${NC}Adding a new user...${NC}"
curl -s -X POST "${LOCAL_URL}/users" \
    -u "root:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "username": "testuser",
            "password": "Abcd1234",
            "uid": ""
        }'

#===========================================================================================
# Fetch all users to validate the creation of 'testuser'
echo -e "\n${NC}Fetching all users...${NC}"
all_users=$(curl -u "root:${TEST_PASSWD}" -s GET "${LOCAL_URL}/users")
if ! echo "${all_users}" | jq -e '.[] | select(.username == "testuser")' > /dev/null; then
    echo -e "\n${RED}USER NOT FOUND IN ALL USERS!${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET ALL USERS SUCCESSFUL - USER FOUND${NC}"

#===========================================================================================
# Delete the created user using DELETE with the 'delete_home' flag
echo -e "\n${NC}Deleting user 'testuser' with 'delete_home': 1...${NC}"
curl -u "root:${TEST_PASSWD}" -s -X DELETE "${LOCAL_URL}/users/testuser" \
    -H "Content-Type: application/json" \
    -d '{"delete_home": 1}'

#===========================================================================================
# Fetch all users to ensure 'testuser' is deleted
echo -e "\n${NC}Fetching all users again to validate deletion...${NC}"
all_users_after_deletion=$(curl -u "root:${TEST_PASSWD}" -s GET "${LOCAL_URL}/users")
if echo "${all_users_after_deletion}" | jq -e '.[] | select(.username == "testuser")' > /dev/null; then
    echo -e "\n${RED}USER STILL FOUND AFTER DELETION!${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET ALL USERS SUCCESSFUL - USER DELETED${NC}"

echo -e "\n${GREEN}USERS TESTS SUCCESSFUL${NC}"

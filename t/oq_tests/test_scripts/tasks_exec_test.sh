#!/bin/bash
set -uo pipefail

TASKS_EXEC_SCRIPT_DIR=$(dirname "$(realpath "$0")")
source "${TASKS_EXEC_SCRIPT_DIR}/common.sh"

#===========================================================================================
# Set up data
echo -e "\n${NC}Adding a new user...${NC}"
curl -s -X POST "${LOCAL_URL}/users" \
    -u "${USER}:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "username": "testmax",
            "password": "Abcd1234",
            "uid": ""
        }'

echo -e "\n${NC}Adding a new task...${NC}"
new_task=$(curl -s -X POST "${LOCAL_URL}/tasks" \
    -u "${USER}:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "description": "printenv",
            "parameters": "| grep 1234",
            "username": "testmax",
            "environment_vars": {
                "KEY": "1234"
            },
            "command": "printenv"
        }'
)

task_id=$(echo "${new_task}" | grep -oP '"id":\s*"\K[^"]+')
if [[ -z "${task_id}" ]]; then
    echo -e "\n${RED}FAILED TO CREATE TASK - NO ID RETURNED${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK CREATED SUCCESSFULLY WITH ID: ${task_id}${NC}"


#===========================================================================================
# Execute task
echo -e "\n${NC}Starting task execution...${NC}"
execution_response=$(curl -s -X POST "${LOCAL_URL}/tasks/executions/${task_id}" \
    -u "${USER}:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "password": "Abcd1234"
        }'
)

execution_pid=$(echo "${execution_response}" | grep -oP '"running_task_pid":\s*\K\d+')
if [[ -z "${execution_pid}" ]]; then
    echo -e "\n${RED}FAILED TO RUN TASK${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK RUNNING WITH PID: ${execution_pid}${NC}"

#===========================================================================================
# Validate task lifecycle
echo -e "\n${NC}Checking task execution...${NC}"
check_response=$(curl -u "${USER}:${TEST_PASSWD}" -s "${LOCAL_URL}/tasks/executions/last")

return_status=$(echo "${check_response}" | grep -oP '"exit_code":\s*\K\d+')
if [ "${return_status}" != "${EXIT_CODE_SUCCESS}" ]; then
    echo -e "\n${RED}TASK FAILED: Status is ${return_status}${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi

if ! echo "${check_response}" | grep -q 'KEY=1234'; then
    echo -e "\n${RED}TASK OUTPUT INVALID: Missing 'KEY=1234'${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi

last_task=$(curl -u "${USER}:${TEST_PASSWD}" -s -X GET "${LOCAL_URL}/tasks/executions/last")
if ! echo "${last_task}" | grep -q 'KEY=1234'; then
    echo -e "\n${RED}TASK OUTPUT INVALID: Missing 'KEY=1234'${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK SUCCEEDED AND OUTPUT IS VALID${NC}"

ongoing_status=$(curl -u "${USER}:${TEST_PASSWD}" -s -o /dev/null -w "%{http_code}" -X GET "${LOCAL_URL}/tasks/executions/ongoing")
if [ "${ongoing_status}" -ne "404" ]; then
    echo -e "\n${RED}ONGOING TASK CHECK FAILED'${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}NO TASK RUNNING${NC}"

echo -e "\n${NC}Finishing log review...${NC}"
curl -u "${USER}:${TEST_PASSWD}" -s -X DELETE "${LOCAL_URL}/tasks/executions/last"

echo -e "\n${NC}Deleting user 'testmax' with 'delete_home': 1...${NC}"
curl -u "${USER}:${TEST_PASSWD}" -s -X DELETE "${LOCAL_URL}/users/testmax" \
    -H "Content-Type: application/json" \
    -d '{"delete_home": 1}'

echo -e "\n${NC}Deleting task with ID: ${task_id}...${NC}"
curl -u "${USER}:${TEST_PASSWD}" -s -X DELETE "${LOCAL_URL}/tasks/${task_id}"

echo -e "\n${GREEN}TASKS EXECUTION TESTS SUCCESSFUL${NC}"

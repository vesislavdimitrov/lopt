#!/bin/bash
set -uo pipefail

TASKS_CRUD_SCRIPT_DIR=$(dirname "$(realpath "$0")")
source "${TASKS_CRUD_SCRIPT_DIR}/common.sh"

#===========================================================================================
# Create a new task using POST (without pre-setting the 'id')
echo -e "\n${NC}Adding a new task...${NC}"
new_task=$(curl -s -X POST "${LOCAL_URL}/tasks" \
    -u "${USER}:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "description": "Test Task",
            "parameters": "-test",
            "username": "",
            "environment_vars": {
                "TestKey": "TestVal"
            },
            "command": "test"
        }'
)

#===========================================================================================
# Extract the generated task ID
task_id=$(echo "${new_task}" | grep -oP '"id":\s*"\K[^"]+')
if [[ -z "${task_id}" ]]; then
    echo -e "\n${RED}FAILED TO CREATE TASK - NO ID RETURNED${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK CREATED SUCCESSFULLY WITH ID: $task_id${NC}"

# Verify the new task exists in the list
echo -e "\n${NC}Verifying new task exists...${NC}"
tasks=$(curl -u "${USER}:${TEST_PASSWD}" -s "${LOCAL_URL}/tasks")
if ! echo "${tasks}" | jq -e --arg id "${task_id}" '.[] | select(.id == $id)' > /dev/null; then
    echo -e "\n${RED}TASK NOT FOUND IN ALL TASKS!${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET ALL TEST SUCCESSFUL - TASK FOUND${NC}"

# Test GET /tasks/<id>
echo -e "\n${NC}Testing GET /tasks/${task_id}...${NC}"
single_task=$(curl -u "${USER}:${TEST_PASSWD}" -s "${LOCAL_URL}/tasks/${task_id}")
if ! echo "${single_task}" | jq -e --arg id "$task_id" '.id == $id' > /dev/null; then
    echo -e "\n${RED}FAILED TO RETRIEVE TASK WITH ID: $task_id${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET SINGLE TASK TEST SUCCESSFUL - TASK RETRIEVED${NC}"

#===========================================================================================
# Update the task (e.g., updating the description and parameters)
echo -e "\n${NC}Updating task with ID: ${task_id}...${NC}"
curl -s -X PUT "${LOCAL_URL}/tasks/${task_id}" \
    -u "${USER}:${TEST_PASSWD}" \
    -H "Content-Type: application/json" \
    -d '{
            "description": "Updated Test Task",
            "parameters": "-updated",
            "username": "",
            "environment_vars": {
                "TestKey": "TestVal"
            },
            "command": "test"
        }' > /dev/null


# Verify the task is updated
updated_task=$(curl -u "${USER}:${TEST_PASSWD}" -s "${LOCAL_URL}/tasks/${task_id}")
if ! echo "${updated_task}" | jq -e '.description == "Updated Test Task"' > /dev/null && echo "$updated_task" | jq -e '.parameters == "-updated"' > /dev/null; then
    echo -e "\n${RED}FAILED TO UPDATE TASK${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK UPDATED SUCCESSFULLY${NC}"

#===========================================================================================
# Delete the created task
echo -e "\n${NC}Deleting task with ID: ${task_id}...${NC}"
curl -u "${USER}:${TEST_PASSWD}" -s -X DELETE "${LOCAL_URL}/tasks/${task_id}"

# Verify the task has been deleted
echo -e "\n${NC}Verifying task deletion...${NC}"
tasks_after_delte=$(curl -s "${LOCAL_URL}/tasks")

if echo "${tasks_after_delte}" | grep -q "\"id\": \"${task_id}\""; then
    echo -e "\n${RED}TASK DELETION FAILED${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK DELETED SUCCESSFULLY${NC}"

echo -e "\n${GREEN}TASKS CRUD TESTS SUCCESSFUL${NC}"

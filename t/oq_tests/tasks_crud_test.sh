#!/bin/bash
set -uo pipefail
SCRIPT_DIR=$(dirname "$(realpath "$0")")
source "${SCRIPT_DIR}/common.sh"

#===========================================================================================
# Check the base API
if ! curl localhost:5000; then
    echo -e "\n${RED}FAILED TO GET BASE API${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}BASE API TEST SUCCESSFUL${NC}"

#===========================================================================================
# Create a new task using POST (without pre-setting the 'id')
echo -e "\n${NC}Adding a new task...${NC}"
NEW_TASK=$(curl -s -X POST localhost:5000/tasks \
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
TASK_ID=$(echo "$NEW_TASK" | grep -oP '"id":\s*"\K[^"]+')
if [[ -z "$TASK_ID" ]]; then
    echo -e "\n${RED}FAILED TO CREATE TASK - NO ID RETURNED${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK CREATED SUCCESSFULLY WITH ID: $TASK_ID${NC}"

# Verify the new task exists in the list
echo -e "\n${NC}Verifying new task exists...${NC}"
TASKS=$(curl -s localhost:5000/tasks)
if ! echo "$TASKS" | jq -e --arg id "$TASK_ID" '.[] | select(.id == $id)' > /dev/null; then
    echo -e "\n${RED}TASK NOT FOUND IN ALL TASKS!${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET ALL TEST SUCCESSFUL - TASK FOUND${NC}"

# Test GET /tasks/<id>
echo -e "\n${NC}Testing GET /tasks/$TASK_ID...${NC}"
SINGLE_TASK=$(curl -s "localhost:5000/tasks/$TASK_ID")
if ! echo "$SINGLE_TASK" | jq -e --arg id "$TASK_ID" '.id == $id' > /dev/null; then
    echo -e "\n${RED}FAILED TO RETRIEVE TASK WITH ID: $TASK_ID${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}GET SINGLE TASK TEST SUCCESSFUL - TASK RETRIEVED${NC}"

#===========================================================================================
# Update the task (e.g., updating the description and parameters)
echo -e "\n${NC}Updating task with ID: $TASK_ID...${NC}"
UPDATED_TASK=$(curl -s -X PUT "localhost:5000/tasks/$TASK_ID" \
    -H "Content-Type: application/json" \
    -d '{
            "description": "Updated Test Task",
            "parameters": "-updated",
            "username": "",
            "environment_vars": {
                "TestKey": "TestVal"
            },
            "command": "test"
        }'
)

# Verify the task is updated
UPDATED_SINGLE_TASK=$(curl -s "localhost:5000/tasks/$TASK_ID")
if ! echo "$UPDATED_SINGLE_TASK" | jq -e '.description == "Updated Test Task"' > /dev/null && echo "$UPDATED_SINGLE_TASK" | jq -e '.parameters == "-updated"' > /dev/null; then
    echo -e "\n${RED}FAILED TO UPDATE TASK${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK UPDATED SUCCESSFULLY${NC}"

#===========================================================================================
# Delete the created task
echo -e "\n${NC}Deleting task with ID: $TASK_ID...${NC}"
curl -s -X DELETE "localhost:5000/tasks/$TASK_ID"

# Verify the task has been deleted
echo -e "\n${NC}Verifying task deletion...${NC}"
TASKS_AFTER_DELETE=$(curl -s localhost:5000/tasks)

if echo "$TASKS_AFTER_DELETE" | grep -q "\"id\": \"$TASK_ID\""; then
    echo -e "\n${RED}TASK DELETION FAILED${NC}"
    exit "${EXIT_CODE_FAILURE}"
fi
echo -e "\n${GREEN}TASK DELETED SUCCESSFULLY${NC}"

echo -e "\n${GREEN}TASKS CRUD TESTS SUCCESSFUL${NC}"
#===========================================================================================
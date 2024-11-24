#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'
RED='\033[0;31m'

# Check the base API
curl localhost:5000
echo -e "\n${GREEN}BASE API TEST SUCCESSFUL${NC}"

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
    }')

# Extract the generated task ID
TASK_ID=$(echo "$NEW_TASK" | grep -oP '"id":\s*"\K[^"]+')

if [[ -z "$TASK_ID" ]]; then
    echo -e "\n${RED}FAILED TO CREATE TASK - NO ID RETURNED${NC}"
    exit 1
fi

echo -e "\n${GREEN}TASK CREATED SUCCESSFULLY WITH ID: $TASK_ID${NC}"

# Verify the new task exists in the list
echo -e "\n${NC}Veryfing new task exists...${NC}"
TASKS=$(curl -s localhost:5000/tasks)

# Use jq to check if the task exists
if echo "$TASKS" | jq -e --arg id "$TASK_ID" '.[] | select(.id == $id)' > /dev/null; then
    echo -e "\n${GREEN}GET ALL TEST SUCCESSFUL - TASK FOUND${NC}"
else
    echo -e "\n${RED}TASK NOT FOUND IN ALL TASKS!${NC}"
    exit 1
fi

# Test GET /tasks/<id>
echo -e "\n${NC}Tesing GET /tasks/$TASK_ID...${NC}"
SINGLE_TASK=$(curl -s "localhost:5000/tasks/$TASK_ID")

if echo "$SINGLE_TASK" | jq -e --arg id "$TASK_ID" '.id == $id' > /dev/null; then
    echo -e "\n${GREEN}GET SINGLE TASK TEST SUCCESSFUL - TASK RETRIEVED${NC}"
else
    echo -e "\n${RED}FAILED TO RETRIEVE TASK WITH ID: $TASK_ID${NC}"
    exit 1
fi

# Delete the created task
echo -e "\n${NC}Deleting task with ID: $TASK_ID...${NC}"
curl -s -X DELETE "localhost:5000/tasks/$TASK_ID"

# Verify the task has been deleted
echo -e "\n${NC}Veryfing task deletion...${NC}"
TASKS_AFTER_DELETE=$(curl -s localhost:5000/tasks)

if echo "$TASKS_AFTER_DELETE" | grep -q "\"id\": \"$TASK_ID\""; then
    echo -e "\n${RED}TASK DELETION FAILED${NC}"
    exit 1
else
    echo -e "\n${GREEN}TASK DELETED SUCCESSFULLY${NC}"
fi

 echo -e "\n${GREEN}TASKS CRUD TESTS SUCCESSFUL${NC}"

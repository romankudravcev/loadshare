package dtos

type CreateTaskRequest struct {
	CircleID    uint   `json:"circle_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Weight      int    `json:"weight" binding:"required,min=1,max=5"`
	PlannerID   *uint  `json:"planner_id"`
	OrganizerID *uint  `json:"organizer_id"`
	ReminderID  *uint  `json:"reminder_id"`
	ExecutorID  *uint  `json:"executor_id"`
	When        string `json:"when"`
	Status      string `json:"status"`
	Category    string `json:"category"`
}

type UpdateTaskRequest struct {
	Title       *string `json:"title"`
	Weight      *int    `json:"weight" binding:"omitempty,min=1,max=5"`
	PlannerID   *uint   `json:"planner_id"`
	OrganizerID *uint   `json:"organizer_id"`
	ReminderID  *uint   `json:"reminder_id"`
	ExecutorID  *uint   `json:"executor_id"`
	When        *string `json:"when"`
	Status      *string `json:"status"`
	Category    *string `json:"category"`
}

package dtos

type CreateTaskRequest struct {
	CircleID  uint   `json:"circle_id" binding:"required"`
	Title     string `json:"title" binding:"required"`
	Planner   *uint  `json:"planner"`
	Organizer *uint  `json:"organizer"`
	Reminder  *uint  `json:"reminder"`
	Executor  *uint  `json:"executor"`
	When      string `json:"when"`
	Status    string `json:"status"`
	Weight    int    `json:"weight"`
	Category  string `json:"category"`
}

type UpdateTaskRequest struct {
	Title     *string `json:"title"`
	Planner   *uint   `json:"planner"`
	Organizer *uint   `json:"organizer"`
	Reminder  *uint   `json:"reminder"`
	Executor  *uint   `json:"executor"`
	When      *string `json:"when"`
	Status    *string `json:"status"`
	Weight    *int    `json:"weight"`
	Category  *string `json:"category"`
}

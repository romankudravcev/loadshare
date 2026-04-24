package dtos

type CreateTaskRequest struct {
	CircleID    uint   `json:"circle_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	AssignedTo  *uint  `json:"assigned_to"`
}

type UpdateTaskRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	AssignedTo  *uint   `json:"assigned_to"`
	IsCompleted *bool   `json:"is_completed"`
}

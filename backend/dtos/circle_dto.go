package dtos

type CreateCircleRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCircleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

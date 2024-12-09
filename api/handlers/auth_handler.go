package handlers

import (
	"document-approval/api/response"
	"document-approval/services/user"
	"encoding/json"
	"net/http"
)

type AuthHandler struct {
	userService *user.UserService
}

func NewAuthHandler(userService *user.UserService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	user, err := h.userService.Authenticate(req.Email, req.Password)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}

	// В реальном приложении здесь нужно генерировать JWT токен
	token := "test-token"

	response.Success(w, map[string]interface{}{
		"token": token,
		"user":  user,
	})
}

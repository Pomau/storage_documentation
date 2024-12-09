package handlers

import (
	"net/http"

	"document-approval/api/response"
)

// @Summary Callback ЕСИА
// @Description Обработка callback от ЕСИА после авторизации
// @Tags auth
// @Accept json
// @Produce json
// @Param code query string true "Код авторизации"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Router /auth/esia [get]
func ESIACallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		response.Error(w, http.StatusBadRequest, "Missing authorization code")
		return
	}

	// В реальном приложении здесь будет обработка кода авторизации
	// и получение токена от ЕСИА
	response.Success(w, map[string]string{
		"message": "Authorization successful",
		"code":    code,
	})
}

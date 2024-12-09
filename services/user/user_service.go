package user

import (
	"database/sql"
	"document-approval/models"
	"fmt"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{
		db: db,
	}
}

func (s *UserService) Authenticate(email, password string) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(`
        SELECT id, first_name, last_name, email, created_at
        FROM users WHERE email = $1 AND password = $2
    `, email, password).Scan(
		&user.ID, &user.FirstName,
		&user.LastName, &user.Email, &user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("неверный email или пароль")
	}
	if err != nil {
		return nil, fmt.Errorf("ошибка аутентификации: %w", err)
	}

	return &user, nil
}

func (s *UserService) GetUserByID(id int64) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(`
        SELECT id, first_name, last_name, email, created_at
        FROM users WHERE id = $1
    `, id).Scan(
		&user.ID, &user.FirstName,
		&user.LastName, &user.Email, &user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("пользователь не найден")
	}
	if err != nil {
		return nil, fmt.Errorf("ошибка получения пользователя: %w", err)
	}

	return &user, nil
}

func (s *UserService) GetUserRoles(userID int64) ([]string, error) {
	rows, err := s.db.Query(`
        SELECT role FROM user_roles WHERE user_id = $1
    `, userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения ролей: %w", err)
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			return nil, fmt.Errorf("ошибка сканирования роли: %w", err)
		}
		roles = append(roles, role)
	}

	return roles, nil
}

func (s *UserService) AssignRole(userID int64, role models.Role) error {
	_, err := s.db.Exec(`
        INSERT INTO user_roles (user_id, role)
        VALUES ($1, $2)
        ON CONFLICT (user_id, role) DO NOTHING
    `, userID, role)

	if err != nil {
		return fmt.Errorf("ошибка назначения роли: %w", err)
	}

	return nil
}

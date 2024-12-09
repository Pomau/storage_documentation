package esia

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type ESIAService struct {
	clientID     string
	clientSecret string
	redirectURI  string
	esiaURL      string
}

type UserInfo struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
}

func NewESIAService(clientID, clientSecret, redirectURI string) *ESIAService {
	return &ESIAService{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		esiaURL:      "https://esia.gosuslugi.ru",
	}
}

func (s *ESIAService) GetAuthURL() string {
	params := url.Values{}
	params.Add("client_id", s.clientID)
	params.Add("response_type", "code")
	params.Add("redirect_uri", s.redirectURI)

	return fmt.Sprintf("%s/aas/oauth2/authorize?%s", s.esiaURL, params.Encode())
}

func (s *ESIAService) GetToken(authCode string) (string, error) {
	params := url.Values{}
	params.Add("client_id", s.clientID)
	params.Add("client_secret", s.clientSecret)
	params.Add("grant_type", "authorization_code")
	params.Add("code", authCode)
	params.Add("redirect_uri", s.redirectURI)

	resp, err := http.PostForm(fmt.Sprintf("%s/aas/oauth2/te", s.esiaURL), params)
	if err != nil {
		return "", fmt.Errorf("ошибка запроса токена: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("ошибка декодирования ответа: %w", err)
	}

	if result.Error != "" {
		return "", fmt.Errorf("ошибка получения токена: %s", result.Error)
	}

	return result.AccessToken, nil
}

func (s *ESIAService) GetUserInfo(accessToken string) (*UserInfo, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/rs/prns/v1/info", s.esiaURL), nil)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса информации о пользователе: %w", err)
	}
	defer resp.Body.Close()

	var userInfo UserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("ошибка декодирования информации о пользователе: %w", err)
	}

	return &userInfo, nil
}

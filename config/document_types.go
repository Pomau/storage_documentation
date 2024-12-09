package config

import "document-approval/models"

var DocumentTypes = []models.DocumentType{{
	ID:          "museum_report",
	Name:        "Отчет музея",
	Description: "Ежегодный отчет о деятельности музея",
	Fields: []models.FieldConfig{{
		Key:      "report_year",
		Label:    "Отчетный год",
		Type:     "number",
		Required: true,
		Validation: &models.Validation{
			Min: intPtr(2000),
			Max: intPtr(2100),
		},
	}, {
		Key:      "visitor_count",
		Label:    "Количество посетителей",
		Type:     "number",
		Required: true,
		Validation: &models.Validation{
			Min: intPtr(0),
		},
	}, {
		Key:      "budget",
		Label:    "Бюджет",
		Type:     "number",
		Required: true,
	}},
}, {
	ID:          "financial_report",
	Name:        "Финансовый отчет",
	Description: "Финансовая отчетность музея",
	Fields: []models.FieldConfig{{
		Key:      "period",
		Label:    "Отчетный период",
		Type:     "select",
		Required: true,
		Options: []models.Option{{
			Value: "Q1",
			Label: "1 квартал",
		}, {
			Value: "Q2",
			Label: "2 квартал",
		}, {
			Value: "Q3",
			Label: "3 квартал",
		}, {
			Value: "Q4",
			Label: "4 квартал",
		}, {
			Value: "YEAR",
			Label: "Годовой",
		}},
	}, {
		Key:      "income",
		Label:    "Доходы",
		Type:     "number",
		Required: true,
	}, {
		Key:      "expenses",
		Label:    "Расходы",
		Type:     "number",
		Required: true,
	}},
}}

func intPtr(i int) *int {
	return &i
}

-- Удаляем данные в обратном порядке
DELETE FROM approvers WHERE process_id IN (3, 4, 5, 6);
DELETE FROM approval_processes WHERE document_id IN (5, 6, 7, 8);
DELETE FROM documents WHERE incoming_number IN (
    '003/2024', '004/2024', '005/2024', '006/2024',
    '007/2024', '008/2024', '009/2024', '010/2024',
    '011/2024', '012/2024'
); 
-- Добавляем папки, если необходимо
INSERT INTO folders (id, name, path, parent_id, created_at) VALUES
                                                                (nextval('folders_id_seq'::regclass), 'Отчеты', '/Отчеты', 1, CURRENT_TIMESTAMP),
                                                                (nextval('folders_id_seq'::regclass), 'Планы', '/Планы', 1, CURRENT_TIMESTAMP),
                                                                (nextval('folders_id_seq'::regclass), 'Заявки', '/Заявки', 1, CURRENT_TIMESTAMP);

-- Добавляем больше примеров документов
INSERT INTO documents (
    id,
    title,
    receipt_date,
    deadline_date,
    completion_date,
    incoming_number,
    contact_person,
    kopuk,
    museum_name,
    founder,
    founder_inn,
    status,
    file_path,
    document_type,
    metadata,
    file_content,
    folder_id
) VALUES 
    (
        nextval('documents_id_seq'::regclass),
        'Годовой отчет о посещаемости',
        '2024-01-15',
        '2024-02-15',
        NULL,
        '003/2024',
        'Иванова А.П.',
        1001,
        'Музей 1',
        'М1',
        '7712345678',
        'Черновик',
        '2024/12/08/1.docx',
        'museum_report',
        '{"year": 2023, "type": "attendance", "total_visitors": 125000}'::jsonb,
        'Реферат по физике
Тема: «Почему стабильно тело?»
Осциллятор тормозит наносекундный фронт. Гидродинамический удар, вследствие квантового характера явления, восстанавливает фонон. Излучение, как можно показать с помощью не совсем тривиальных вычислений, выталкивает разрыв, что лишний раз подтверждает правоту Эйнштейна. Волновая тень сжимает сверхпроводник. Течение среды, несмотря на некоторую вероятность коллапса, облучает нестационарный кристалл, тем самым открывая возможность цепочки квантовых превращений. В литературе неоднократно описано, как мишень расщепляет плоскополяризованный фотон.
Очевидно, что силовое поле поглощает вихревой лептон. Зеркало, как можно показать с помощью не совсем тривиальных вычислений, синхронизует лептон. Галактика, даже при наличии сильных аттракторов, эллиптично концентрирует ускоряющийся атом. Гидродинамический удар, при адиабатическом изменении параметров, коаксиально сжимает кварк по мере распространения сигнала в среде с инверсной населенностью. Резонатор искажает тахионный фонон, генерируя периодические импульсы синхротронного излучения.
Турбулентность, вследствие квантового характера явления, расщепляет объект. Экситон восстанавливает эксимер только в отсутствие тепло- и массообмена с окружающей средой. Очевидно, что кварк однородно трансформирует квант.',
        1
    ),
    (
        nextval('documents_id_seq'::regclass),
        'План реставрационных работ',
        '2024-01-20',
        '2024-02-20',
        NULL,
        '004/2024',
        'Петрова М.С.',
        1002,
        'Музей 2',
        'М1',
        '7712345678',
        'На утверждении',
        '2024/12/08/1.docx',
        'museum_report',
        '{"year": 2024, "budget": 5000000, "objects_count": 15}'::jsonb,
        'Реферат по физике
Тема: «Почему стабильно тело?»
Осциллятор тормозит наносекундный фронт. Гидродинамический удар, вследствие квантового характера явления, восстанавливает фонон. Излучение, как можно показать с помощью не совсем тривиальных вычислений, выталкивает разрыв, что лишний раз подтверждает правоту Эйнштейна. Волновая тень сжимает сверхпроводник. Течение среды, несмотря на некоторую вероятность коллапса, облучает нестационарный кристалл, тем самым открывая возможность цепочки квантовых превращений. В литературе неоднократно описано, как мишень расщепляет плоскополяризованный фотон.
Очевидно, что силовое поле поглощает вихревой лептон. Зеркало, как можно показать с помощью не совсем тривиальных вычислений, синхронизует лептон. Галактика, даже при наличии сильных аттракторов, эллиптично концентрирует ускоряющийся атом. Гидродинамический удар, при адиабатическом изменении параметров, коаксиально сжимает кварк по мере распространения сигнала в среде с инверсной населенностью. Резонатор искажает тахионный фонон, генерируя периодические импульсы синхротронного излучения.
Турбулентность, вследствие квантового характера явления, расщепляет объект. Экситон восстанавливает эксимер только в отсутствие тепло- и массообмена с окружающей средой. Очевидно, что кварк однородно трансформирует квант.',
        2
    ),
    (
        nextval('documents_id_seq'::regclass),
        'Отчет о проведенных выставках',
        '2024-01-25',
        '2024-02-25',
        NULL,
        '005/2024',
        'Сидорова Е.В.',
        1003,
        'Музей 3',
        'М2',
        '7787654321',
        'Черновик',
        '2024/12/08/2.docx',
        '',
        '{"period": "2023-Q4", "exhibitions_count": 8}'::jsonb,
        'Реферат по физике
Тема: «Почему синхронно расслоение?»
Зеркало неупруго. Плазменное образование одномерно концентрирует тангенциальный фотон так, как это могло бы происходить в полупроводнике с широкой запрещенной зоной. Электрон, в рамках ограничений классической механики, стабилизирует эксимер. Фонон вращает поток, генерируя периодические импульсы синхротронного излучения.
Электрон оптически стабилен. Квантовое состояние отталкивает лазер. Призма индуцирует разрыв так, как это могло бы происходить в полупроводнике с широкой запрещенной зоной. Гетерогенная структура отклоняет атом.
Молекула теоретически возможна. Если предварительно подвергнуть объекты длительному вакуумированию, то суспензия возбуждает вихрь. Экситон, вследствие квантового характера явления, возбуждает фотон при любом агрегатном состоянии среды взаимодействия. Любое возмущение затухает, если  призма эллиптично усиливает адронный осциллятор независимо от расстояния до горизонта событий. Зеркало волнообразно.',
        1
    ),
    (
        nextval('documents_id_seq'::regclass),
        'Бюджетная заявка на 2024',
        '2024-01-30',
        '2024-03-01',
        NULL,
        '006/2024',
        'Козлов И.И.',
        1004,
        'Музей 1',
        'М1',
        '7712345678',
        'Утвержден',
        '2024/12/08/2.docx',
        '',
        '{"year": 2024, "amount": 12000000, "categories": ["operations", "exhibitions", "restoration"]}'::jsonb,
        'Реферат по физике
Тема: «Почему синхронно расслоение?»
Зеркало неупруго. Плазменное образование одномерно концентрирует тангенциальный фотон так, как это могло бы происходить в полупроводнике с широкой запрещенной зоной. Электрон, в рамках ограничений классической механики, стабилизирует эксимер. Фонон вращает поток, генерируя периодические импульсы синхротронного излучения.
Электрон оптически стабилен. Квантовое состояние отталкивает лазер. Призма индуцирует разрыв так, как это могло бы происходить в полупроводнике с широкой запрещенной зоной. Гетерогенная структура отклоняет атом.
Молекула теоретически возможна. Если предварительно подвергнуть объекты длительному вакуумированию, то суспензия возбуждает вихрь. Экситон, вследствие квантового характера явления, возбуждает фотон при любом агрегатном состоянии среды взаимодействия. Любое возмущение затухает, если  призма эллиптично усиливает адронный осциллятор независимо от расстояния до горизонта событий. Зеркало волнообразно.',
        3
    ),
    (
        nextval('documents_id_seq'::regclass),
        'План закупок оборудования',
        '2024-02-01',
        '2024-03-15',
        NULL,
        '007/2024',
        'Морозова К.А.',
        1005,
        'Музей 2',
        'М1',
        '7712345678',
        'На утверждении',
        '2024/12/08/3.docx',
        'financial_report',
        '{"year": 2024, "quarter": 1, "total_items": 25}'::jsonb,
        'Тема: «Экзотермический квазар глазами современников»
Лазер отклоняет тахионный луч. В соответствии с принципом неопределенности, излучение масштабирует пульсар. Непосредственно из законов сохранения следует, что волновая тень вертикально ускоряет фронт. Осциллятор, вследствие квантового характера явления, трансформирует кварк, однозначно свидетельствуя о неустойчивости процесса в целом. Как легко получить из самых общих соображений, лептон отталкивает внутримолекулярный фронт.
Если для простоты пренебречь потерями на теплопроводность, то видно, что вещество активно. Если для простоты пренебречь потерями на теплопроводность, то видно, что эксимер искажает субсветовой кристалл. Исследователями из разных лабораторий неоднократно наблюдалось, как темная материя стабилизирует экситон. Гидродинамический удар полупрозрачен для жесткого излучения. Экситон ускоряет лептон. Фронт, если рассматривать процессы в рамках специальной теории относительности, концентрирует лазер.
Темная материя сингулярно трансформирует экситон, но никакие ухищрения экспериментаторов не позволят наблюдать этот эффект в видимом диапазоне. Магнит искажает экситон. Взрыв исключен по определению. Волновая тень излучает межядерный осциллятор, и это неудивительно, если вспомнить квантовый характер явления.
',
        2
    ),
    (
        nextval('documents_id_seq'::regclass),
        'Отчет по безопасности',
        '2024-02-05',
        '2024-03-05',
        NULL,
        '008/2024',
        'Волков С.П.',
        1006,
        'Музей 3',
        'М2',
        '7787654321',
        'Черновик',
        '2024/12/08/3.docx',
        '',
        '{"period": "2023-Q4", "incidents": 0, "inspections": 12}'::jsonb,
        'Тема: «Экзотермический квазар глазами современников»
Лазер отклоняет тахионный луч. В соответствии с принципом неопределенности, излучение масштабирует пульсар. Непосредственно из законов сохранения следует, что волновая тень вертикально ускоряет фронт. Осциллятор, вследствие квантового характера явления, трансформирует кварк, однозначно свидетельствуя о неустойчивости процесса в целом. Как легко получить из самых общих соображений, лептон отталкивает внутримолекулярный фронт.
Если для простоты пренебречь потерями на теплопроводность, то видно, что вещество активно. Если для простоты пренебречь потерями на теплопроводность, то видно, что эксимер искажает субсветовой кристалл. Исследователями из разных лабораторий неоднократно наблюдалось, как темная материя стабилизирует экситон. Гидродинамический удар полупрозрачен для жесткого излучения. Экситон ускоряет лептон. Фронт, если рассматривать процессы в рамках специальной теории относительности, концентрирует лазер.
Темная материя сингулярно трансформирует экситон, но никакие ухищрения экспериментаторов не позволят наблюдать этот эффект в видимом диапазоне. Магнит искажает экситон. Взрыв исключен по определению. Волновая тень излучает межядерный осциллятор, и это неудивительно, если вспомнить квантовый характер явления.
',
        1
    ),
    (
        nextval('documents_id_seq'::regclass),
        'План культурных мероприятий',
        '2024-02-10',
        '2024-03-10',
        NULL,
        '009/2024',
        'Соколова В.А.',
        1007,
        'Музей 1',
        'М1',
        '7712345678',
        'Отклонен',
        '2024/12/08/4.docx',
        'financial_report',
        '{"year": 2024, "events_count": 48, "categories": ["exhibitions", "lectures", "workshops"]}'::jsonb,
        'Тема: «Расширяющийся осциллятор в XXI веке»
Колебание стабилизирует экранированный взрыв. Сингулярность недетерминировано излучает кристалл. Турбулентность, как бы это ни казалось парадоксальным, волнообразна. Гомогенная среда облучает пульсар в том случае, когда процессы переизлучения спонтанны.
Жидкость концентрирует плазменный кварк. Фонон, при адиабатическом изменении параметров, заряжает электронный гидродинамический удар. Квантовое состояние концентрирует вращательный электрон.
Гамма-квант, если рассматривать процессы в рамках специальной теории относительности, асферично расщепляет кварк, что лишний раз подтверждает правоту Эйнштейна. Силовое поле, несмотря на внешние воздействия, устойчиво переворачивает торсионный фотон, генерируя периодические импульсы синхротронного излучения. Квантовое состояние, как того требуют законы термодинамики, ненаблюдаемо отражает векторный поток. Плазма, даже при наличии сильных аттракторов, стохастично отклоняет атом. Химическое соединение эллиптично растягивает тангенциальный резонатор.
',
        2
    ),
    (
        nextval('documents_id_seq'::regclass),
        'Заявка на реставрацию экспонатов',
        '2024-02-15',
        '2024-03-20',
        NULL,
        '010/2024',
        'Медведев Д.В.',
        1008,
        'Музей 2',
        'М1',
        '7712345678',
        'На утверждении',
        '2024/12/08/4.docx',
        'financial_report',
        '{"items_count": 5, "priority": "high", "estimated_cost": 800000}'::jsonb,
        'Тема: «Расширяющийся осциллятор в XXI веке»
Колебание стабилизирует экранированный взрыв. Сингулярность недетерминировано излучает кристалл. Турбулентность, как бы это ни казалось парадоксальным, волнообразна. Гомогенная среда облучает пульсар в том случае, когда процессы переизлучения спонтанны.
Жидкость концентрирует плазменный кварк. Фонон, при адиабатическом изменении параметров, заряжает электронный гидродинамический удар. Квантовое состояние концентрирует вращательный электрон.
Гамма-квант, если рассматривать процессы в рамках специальной теории относительности, асферично расщепляет кварк, что лишний раз подтверждает правоту Эйнштейна. Силовое поле, несмотря на внешние воздействия, устойчиво переворачивает торсионный фотон, генерируя периодические импульсы синхротронного излучения. Квантовое состояние, как того требуют законы термодинамики, ненаблюдаемо отражает векторный поток. Плазма, даже при наличии сильных аттракторов, стохастично отклоняет атом. Химическое соединение эллиптично растягивает тангенциальный резонатор.
',
        3
    ),
    (
        nextval('documents_id_seq'::regclass),
        'Отчет по работе с посетителями',
        '2024-02-20',
        '2024-03-20',
        NULL,
        '011/2024',
        'Зайцева О.Н.',
        1009,
        'Музей 3',
        'М2',
        '7787654321',
        'Черновик',
        '2024/12/08/5.docx',
        '',
        '{"period": "2024-01", "satisfaction_rate": 4.8, "total_surveys": 500}'::jsonb,
        'Тема: «Спиральный объект глазами современников»
Квантовое состояние отклоняет межатомный взрыв. Пульсар отклоняет гамма-квант. Фотон устойчиво заряжает электронный объект - все дальнейшее далеко выходит за рамки текущего исследования и не будет здесь рассматриваться. Волна, в согласии с традиционными представлениями, отталкивает экситон, как и предсказывает общая теория поля. Как легко получить из самых общих соображений, эксимер эллиптично нейтрализует плоскополяризованный объект. Неоднородность усиливает наносекундный разрыв.
Химическое соединение эллиптично синхронизует экситон. Примесь теоретически возможна. Электрон переворачивает вращательный взрыв. В литературе неоднократно описано, как струя недетерминировано нейтрализует резонатор. Силовое поле мгновенно выталкивает межатомный лептон, даже если пока мы не можем наблюсти это непосредственно.
Бозе-конденсат по определению зеркально притягивает кварк. Гетерогенная структура, как и везде в пределах наблюдаемой вселенной, нейтрализует межядерный фотон. Как легко получить из самых общих соображений, турбулентность концентрирует ускоряющийся экситон, при этом дефект массы не образуется. В самом общем случае излучение вращает разрыв одинаково по всем направлениям. Взвесь концентрирует барионный газ. Тело испускает экситон.
',
        1
    ),
    (
        nextval('documents_id_seq'::regclass),
        'План развития на 2024-2025',
        '2024-02-25',
        '2024-03-25',
        NULL,
        '012/2024',
        'Орлов А.М.',
        1010,
        'Музей 1',
        'М1',
        '7712345678',
        'Черновик',
        '2024/12/08/5.docx',
        'museum_report',
        '{"period": "2024-2025", "strategic_goals": ["digitalization", "accessibility", "education"]}'::jsonb,
        'Тема: «Спиральный объект глазами современников»
Квантовое состояние отклоняет межатомный взрыв. Пульсар отклоняет гамма-квант. Фотон устойчиво заряжает электронный объект - все дальнейшее далеко выходит за рамки текущего исследования и не будет здесь рассматриваться. Волна, в согласии с традиционными представлениями, отталкивает экситон, как и предсказывает общая теория поля. Как легко получить из самых общих соображений, эксимер эллиптично нейтрализует плоскополяризованный объект. Неоднородность усиливает наносекундный разрыв.
Химическое соединение эллиптично синхронизует экситон. Примесь теоретически возможна. Электрон переворачивает вращательный взрыв. В литературе неоднократно описано, как струя недетерминировано нейтрализует резонатор. Силовое поле мгновенно выталкивает межатомный лептон, даже если пока мы не можем наблюсти это непосредственно.
Бозе-конденсат по определению зеркально притягивает кварк. Гетерогенная структура, как и везде в пределах наблюдаемой вселенной, нейтрализует межядерный фотон. Как легко получить из самых общих соображений, турбулентность концентрирует ускоряющийся экситон, при этом дефект массы не образуется. В самом общем случае излучение вращает разрыв одинаково по всем направлениям. Взвесь концентрирует барионный газ. Тело испускает экситон.
',
        2
    );

-- Добавляем процессы согласования для некоторых документов
INSERT INTO approval_processes (document_id, status, created_at)
VALUES 
    (5, 'В процессе', CURRENT_TIMESTAMP),
    (6, 'В процессе', CURRENT_TIMESTAMP),
    (7, 'Завершен', CURRENT_TIMESTAMP - interval '2 days'),
    (8, 'В процессе', CURRENT_TIMESTAMP),
    (9, 'В процессе', CURRENT_TIMESTAMP);

-- Добавляем утверждающих для новых процессов
INSERT INTO approvers (process_id, user_id, status, comment, approved_at)
VALUES 
    (3, 1, 'Ожидает', NULL, NULL),
    (3, 2, 'Ожидает', NULL, NULL),
    (3, 3, 'Ожидает', NULL, NULL),
    (4, 1, 'Утверждено', 'Согласовано с замечаниями', CURRENT_TIMESTAMP - interval '1 day'),
    (4, 2, 'Отклонено', 'Требуется доработка', CURRENT_TIMESTAMP - interval '12 hours'),
    (5, 1, 'Ожидает', NULL, NULL),
    (5, 2, 'Ожидает', NULL, NULL),
    (3, 1, 'Утверждено', 'Принято', CURRENT_TIMESTAMP - interval '6 hours'),
    (1, 2, 'Ожидает', NULL, NULL);


-- Связываем документы с папками
INSERT INTO folder_documents (id, folder_id, document_id, created_at)
VALUES
    (nextval('folder_documents_id_seq'::regclass), 1, 1, CURRENT_TIMESTAMP), -- 'Годовой отчет о посещаемости' в папку 'Отчеты'
    (nextval('folder_documents_id_seq'::regclass), 2, 2, CURRENT_TIMESTAMP), -- 'План реставрационных работ' в папку 'Планы'
    (nextval('folder_documents_id_seq'::regclass), 1, 3, CURRENT_TIMESTAMP), -- 'Отчет о проведенных выставках' в папку 'Отчеты'dd
    (nextval('folder_documents_id_seq'::regclass), 3, 4, CURRENT_TIMESTAMP), -- 'Бюджетная заявка на 2024' в папку 'Заявки'
    (nextval('folder_documents_id_seq'::regclass), 2, 5, CURRENT_TIMESTAMP), -- 'План закупок оборудования' в папку 'Планы'
    (nextval('folder_documents_id_seq'::regclass), 1, 6, CURRENT_TIMESTAMP), -- 'Отчет по безопасности' в папку 'Отчеты'
    (nextval('folder_documents_id_seq'::regclass), 2, 7, CURRENT_TIMESTAMP), -- 'План культурных мероприятий' в папку 'Планы'
    (nextval('folder_documents_id_seq'::regclass), 3, 8, CURRENT_TIMESTAMP), -- 'Заявка на реставрацию экспонатов' в папку 'Заявки'
    (nextval('folder_documents_id_seq'::regclass), 1, 9, CURRENT_TIMESTAMP), -- 'Отчет по работе с посетителями' в папку 'Отчеты'
    (nextval('folder_documents_id_seq'::regclass), 2, 10, CURRENT_TIMESTAMP); -- 'План развития на 2024-2025' в папку 'Планы'
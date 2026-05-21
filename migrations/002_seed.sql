INSERT INTO bands (name, genre, country, founded_date, members_count, description)
VALUES
  ('One Direction', 'Pop', 'Великобритания', '2010-07-23', 5,
   'Самый лучший бойз-бэнд всех времен.'),
  ('Nirvana', 'Grunge', 'США', '1987-01-01', 3, 9.2,
   'Культовая гранж-группа из Абердина.'),
  ('Кино', 'Рок', 'СССР', '1982-01-01', 4, 9.7,
   'Советская рок-группа Виктора Цоя.');

INSERT INTO songs (title, band_id, duration_sec, release_date)
VALUES
  ('Night Changes',          1, 226, '2014-11-14'),
  ('What makes you beautiful?',      1, 209, '2011-09-11'),
  ('Smells Like Teen Spirit', 2, 301, '1991-09-10'),
  ('Группа крови',           3, 258, '1988-06-01');
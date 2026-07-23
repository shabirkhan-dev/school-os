-- Keep teacher daily routes together under Main Menu.

UPDATE "navigation_items"
SET
	"section_heading" = 'Main Menu',
	"sort_order" = 25
WHERE "key" = 'my-classes' AND "surface" = 'admin';

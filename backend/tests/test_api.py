import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

from fastapi import HTTPException

import main


class ProductivityApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        main.DB_PATH = Path(self.temp_dir.name) / "test.db"
        main.initialize()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_todo_create_complete_and_delete(self):
        created = main.create_todo(main.TodoCreate(title="  Plan the week  "))
        self.assertEqual(created["title"], "Plan the week")
        self.assertFalse(created["completed"])
        self.assertEqual(len(main.list_todos()), 1)

        completed = main.toggle_todo(created["id"])
        self.assertTrue(completed["completed"])
        main.delete_todo(created["id"])
        self.assertEqual(main.list_todos(), [])

    def test_blank_todo_is_rejected(self):
        with self.assertRaises(HTTPException) as error:
            main.create_todo(main.TodoCreate(title="   "))
        self.assertEqual(error.exception.status_code, 422)

    def test_note_create_update_and_delete(self):
        created = main.create_note(main.NoteCreate(title="Idea", content="First thought"))
        self.assertEqual(created["content"], "First thought")
        self.assertEqual(len(main.list_notes()), 1)

        updated = main.update_note(created["id"], main.NoteUpdate(title="A better idea", content="Expanded"))
        self.assertEqual(updated["title"], "A better idea")
        self.assertEqual(updated["content"], "Expanded")
        main.delete_note(created["id"])
        self.assertEqual(main.list_notes(), [])

    def test_blank_note_title_is_rejected(self):
        with self.assertRaises(HTTPException) as error:
            main.create_note(main.NoteCreate(title=" "))
        self.assertEqual(error.exception.status_code, 422)

    def test_vercel_requires_a_persistent_database_url(self):
        with patch.dict("os.environ", {"VERCEL": "1"}), patch.object(main, "DATABASE_URL", None):
            with self.assertRaisesRegex(RuntimeError, "DATABASE_URL"):
                main.initialize()


if __name__ == "__main__":
    unittest.main()

from unittest import TestCase
from app import create_app


class TestGetJugadores(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_jugadores')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_jugadores')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_jugadores')
        self.assertTrue(b'id_jugador' in response.data)
        self.assertTrue(b'nombre_jugador' in response.data)

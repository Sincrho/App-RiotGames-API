from unittest import TestCase
from app import create_app
import json

JUGADOR_GET_TEST = {
    "id_jugador": 1,
    "id_servidor": "LA2",
    "nombre_jugador": "BNarco"
}

JUGADOR_ADD_TEST = {
    "id_jugador": 9999,
    "id_servidor": "LA2",
    "nombre_jugador": "Test"
}

JUGADOR_UPDATE_TEST = {
    "id_jugador": 9999,
    "id_servidor": "LA2",
    "nombre_jugador": "Test"
}

class TestGetJugadores(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    def test_get_jugadores(self):
        response = self.app.get('/get_jugadores')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertTrue(b'id_jugador' in response.data)
        self.assertTrue(b'nombre_jugador' in response.data)

class TestGetJugador(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_get_jugador(self):
        response = self.app.get('/get_jugador/1')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertEqual(JUGADOR_GET_TEST, json.loads(response.data))


class TestAddJugador(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_add_jugador(self):
        response = self.app.post('/add_jugador', json=JUGADOR_ADD_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(JUGADOR_ADD_TEST,response_json)

class TestUpdateJugador(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_jugador(self):
        response = self.app.put('/update_jugador/2', json=JUGADOR_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(JUGADOR_UPDATE_TEST['id_servidor'], response_json['id_servidor'])
        self.assertEqual(JUGADOR_UPDATE_TEST['nombre_jugador'], response_json['nombre_jugador'])

class TestDeleteJugador(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_jugador(self):
        response = self.app.delete('/delete_jugador/9999', json=JUGADOR_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(JUGADOR_ADD_TEST['id_servidor'], response_json['id_servidor'])
        self.assertEqual(JUGADOR_ADD_TEST['nombre_jugador'], response_json['nombre_jugador'])


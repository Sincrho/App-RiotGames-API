from unittest import TestCase
from app import create_app
import json

TORNEO_GET_TEST = {
    "id_torneo": 1,
    "nombre_torneo": "Copa Pascal"
}

TORNEO_ADD_TEST = {
    "id_torneo": 9999,
    "nombre_torneo": "TestTorneo"
}

TORNEO_UPDATE_TEST = {
    "id_torneo": 9999,
    "nombre_torneo": "TestTorneo2"
}

class TestGetTorneos(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    def test_get_torneoes(self):
        response = self.app.get('/get_torneos')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertTrue(b'id_torneo' in response.data)
        self.assertTrue(b'nombre_torneo' in response.data)

class TestGetTorneo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_get_torneo(self):
        response = self.app.get('/get_torneo/1')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertEqual(TORNEO_GET_TEST, json.loads(response.data))


class TestAddTorneo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_add_torneo(self):
        response = self.app.post('/add_torneo', json=TORNEO_ADD_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(TORNEO_ADD_TEST,response_json)

class TestUpdateTorneo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_torneo(self):
        response = self.app.put('/update_torneo/2', json=TORNEO_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(TORNEO_UPDATE_TEST['nombre_torneo'], response_json['nombre_torneo'])

class TestDeleteTorneo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_torneo(self):
        response = self.app.delete('/delete_torneo/9999', json=TORNEO_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(TORNEO_ADD_TEST['nombre_torneo'], response_json['nombre_torneo'])

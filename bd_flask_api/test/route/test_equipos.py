from unittest import TestCase
from app import create_app
import json

EQUIPO_GET_TEST = {
    "id_equipo": 1,
    "nombre_equipo": "Comadreja Team"
}

EQUIPO_ADD_TEST = {
    "id_equipo": 9999,
    "nombre_equipo": "TestEquipo"
}

EQUIPO_UPDATE_TEST = {
    "id_equipo": 9999,
    "nombre_equipo": "TestEquipo2"
}

class TestGetEquipos(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    def test_get_equipoes(self):
        response = self.app.get('/get_equipos')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertTrue(b'id_equipo' in response.data)
        self.assertTrue(b'nombre_equipo' in response.data)

class TestGetEquipo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_get_equipo(self):
        response = self.app.get('/get_equipo/1')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertEqual(EQUIPO_GET_TEST, json.loads(response.data))


class TestAddEquipo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_add_equipo(self):
        response = self.app.post('/add_equipo', json=EQUIPO_ADD_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data) 
        self.assertEqual(EQUIPO_ADD_TEST,response_json)

class TestUpdateEquipo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_equipo(self):
        response = self.app.put('/update_equipo/2', json=EQUIPO_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(EQUIPO_UPDATE_TEST['nombre_equipo'], response_json['nombre_equipo'])

class TestDeleteEquipo(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_update_equipo(self):
        response = self.app.delete('/delete_equipo/9999', json=EQUIPO_UPDATE_TEST)
        #Test que el status sea 200
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        response_json = json.loads(response.data)
        self.assertEqual(EQUIPO_ADD_TEST['nombre_equipo'], response_json['nombre_equipo'])

from unittest import TestCase
from app import create_app
import json

SERVIDOR_GET_TEST = {
    "id_servidor": "NA",
    "region_servidor": "Norteamerica"
}

SERVIDOR_ADD_TEST = {
    "id_servidor": 9999,
    "region_servidor": "TestServidor"
}

class TestGetServidores(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    def test_get_servidores(self):
        response = self.app.get('/get_servidores')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertTrue(b'id_servidor' in response.data)
        self.assertTrue(b'region_servidor' in response.data)

class TestGetServidor(TestCase):
    def setUp(self):
        self.app = create_app().test_client()
  
    def test_get_servidor(self):
        response = self.app.get('/get_servidor/NA')
        statuscode = response.status_code
        #Test que el status sea 200
        self.assertEqual(statuscode, 200)
        #Test que el contenido sea JSON
        self.assertEqual(response.content_type, "application/json")
        #Testea que datos se devuelven
        self.assertEqual(SERVIDOR_GET_TEST, json.loads(response.data))


# class TestAddServidor(TestCase):
#     def setUp(self):
#         self.app = create_app().test_client()
  
#     def test_add_servidor(self):
#         response = self.app.post('/add_servidor', json=SERVIDOR_ADD_TEST)
#         #Test que el status sea 200
#         statuscode = response.status_code
#         self.assertEqual(statuscode, 200)
#         #Test que el contenido sea JSON
#         self.assertEqual(response.content_type, "application/json")
#         #Testea que datos se devuelven
#         response_json = json.loads(response.data)
#         self.assertEqual(SERVIDOR_ADD_TEST,response_json)
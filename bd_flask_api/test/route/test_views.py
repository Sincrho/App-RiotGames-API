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

class TestGetEquipos(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_equipos')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_equipos')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_equipos')
        self.assertTrue(b'id_equipo' in response.data)
        self.assertTrue(b'nombre_equipo' in response.data)

class TestGetTorneos(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_torneos')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_torneos')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_torneos')
        self.assertTrue(b'id_torneo' in response.data)
        self.assertTrue(b'nombre_torneo' in response.data)

class TestGetPartidas(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_partidas')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_partidas')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_partidas')
        self.assertTrue(b'id_partida' in response.data)
        self.assertTrue(b'resultado_partida' in response.data)

class TestGetServidores(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_servidores')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_servidores')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_servidores')
        self.assertTrue(b'id_servidor' in response.data)
        self.assertTrue(b'region_servidor' in response.data)        

class TestGetEquisJugas(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_equis_jugas')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_equis_jugas')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_equis_jugas')
        self.assertTrue(b'id_jugador' in response.data)
        self.assertTrue(b'id_equipo' in response.data)

class TestGetEquisTorneos(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_equis_torneos')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_equis_torneos')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_equis_torneos')
        self.assertTrue(b'id_equipo' in response.data)
        self.assertTrue(b'id_torneo' in response.data)     

class TestGetEquisTorneosPartidas(TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    #Test que el status sea 200
    def test_status(self):
        response = self.app.get('/get_equis_torneos_partidas')
        statuscode = response.status_code
        self.assertEqual(statuscode, 200)
    #Test que el contenido sea JSON
    def test_content(self):
        response = self.app.get('/get_equis_torneos_partidas')
        self.assertEqual(response.content_type, "application/json")
    #Testea que datos se devuelven
    def test_data(self):
        response = self.app.get('/get_equis_torneos_partidas')
        self.assertTrue(b'id_equipo' in response.data)
        self.assertTrue(b'id_torneo' in response.data)
        self.assertTrue(b'id_partida' in response.data)         
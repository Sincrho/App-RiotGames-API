# App-RiotGames-API
Integracion de la API de Riot Games para hacer torneos

Configuracion entorno

    Instalar requerimientos: pipenv install
                             pipenv run pip install SQLAlchemy
                             pipenv run pip install flask_sqlalchemy
                             pipenv run pip install flask_marshmallow
                             pipenv run pip install flask_cors
							 pipenv run pip install requests
                             
    Modo Debug en CMD: set FLASK_ENV=development
    Modo Debug en Powershell: $env:FLASK_ENV = "development"
    
    Iniciar servidor: pipenv run python -m flask run
	
	Para el svelte npm install materialize-css@next

Referencia
    Como hacer un requirements.txt con pipenv para usarlo en docker
    https://pipenv-fork.readthedocs.io/en/latest/basics.html

Docker
    Iniciar Api en flask:   /bd_flask_api
                            docker build -t flaskapp:latest .
                            docker run -it -d -p 5000:5000 flaskapp
    Sitio hecho con Svelte: /svelte_app
                            docker build -t svelteapp:latest .
                            docker run -it -d -p 5001:5000 svelteapp

Sino usar el compose ya hecho



    
    
    

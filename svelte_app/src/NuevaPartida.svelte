<script>
  const apiURL = "http://127.0.0.1:5000/add_partida"

  let nombrePartidaNueva = "";

  async function crearPartida() {
    const response= await fetch(apiURL,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_partida": null,
              "resultado_partida": nombrePartidaNueva
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/Partidas";
    console.log(result)
  }   
</script>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nueva Partida</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombrePartidaNueva} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Resultado Partida</label>
            </div>
          </div>
          
          
          <div class = "container">
              <a class="waves-effect waves-light btn  blue darken-1 white-text" on:click={()=> crearPartida()}><i class="material-icons left #4527a0  white-text ">check_circle</i>Agregar</a>
              
          </div>

        </div>
      </div>
    </div>
  </div>
</body>
<script>
  const apiURLAddTorneo = "http://127.0.0.1:5000/add_torneo"

  let nombreTorneoNuevo = "";

  async function crearTorneo() {
    const response= await fetch(apiURLAddTorneo,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_torneo": null,
              "nombre_torneo": nombreTorneoNuevo
            })
        });
    location.href = "/#/Torneos";    
    //const json = await response.json()
    //let result = JSON.stringify(json)
    //console.log(result)
  }   
</script>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nuevo Torneo</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombreTorneoNuevo} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Torneo</label>
            </div>
          </div>
          <div class = "container">
              <button class ="waves-effect waves-light btn  blue darken-1" on:click={()=> crearTorneo()}><i class="material-icons left ">check_circle</i>Agregar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
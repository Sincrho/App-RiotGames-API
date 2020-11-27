
<script>
  import { onMount } from "svelte";
  const apiURL = "http://127.0.0.1:5000/add_equipo"

  let nombreEquipoNuevo = "";

  async function crearEquipo() {
    const response= await fetch(apiURL,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": null,
              "nombre_equipo": nombreEquipoNuevo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/Equipos";
    console.log(result)
  }   
</script>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nuevo Equipo</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={nombreEquipoNuevo} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Equipo</label>
            </div>
          </div>
          
          
          <div class = "container">
              <a class="waves-effect waves-light btn deep- blue darken-1 white-text" on:click={()=> crearEquipo()}><i class="material-icons left #4527a0 deep- white-text ">check_circle</i>Agregar</a>
              
          </div>

        </div>
      </div>
    </div>
  </div>
</body>
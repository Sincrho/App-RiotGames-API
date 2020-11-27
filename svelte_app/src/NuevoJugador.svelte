
<script>
  import { onMount } from "svelte";
  const apiURL2 = "http://127.0.0.1:5000/get_servidores";
  const apiURLx = "http://127.0.0.1:5000/add_jugador"
  let dataServidores = [];
  let selected;
  let nombreJugadorNuevo = "";

  onMount(async function(){
        const response = await fetch(apiURL2);
        dataServidores  = await response.json();
        console.log(dataServidores)
  });  

  async function crearJugador() {
    const response= await fetch(apiURLx,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": selected,
              "nombre_jugador": nombreJugadorNuevo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/Jugadores";
    console.log(result)
  }

</script>







<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nuevo Jugador</span>

        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input bind:value={nombreJugadorNuevo} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Nombre Invocador</label>
            </div>
          </div>
          
          <div class="container">
            <div class="row input-field col s6 offset">       
                <select  bind:value={selected} class="browser-default">
                  <option value="" disabled selected>Servidor</option>
                  {#each dataServidores as servidor }
                  <option value={servidor.id_servidor}>{servidor.region_servidor}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Nombre Servidor</label>
              </div>
          </div>
          <div class = "container">
              <a style="color:white" href="" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> crearJugador()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
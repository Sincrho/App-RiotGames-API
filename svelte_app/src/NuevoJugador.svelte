<script>
  import { onMount } from "svelte";
  const apiURLGetServidores = "http://127.0.0.1:5000/get_servidores";
  const apiURLAddJugador = "http://127.0.0.1:5000/add_jugador"
  let dataServidores = [];
  let selected;
  let nombreJugadorNuevo = "";

  onMount(async function(){
        const response = await fetch(apiURLGetServidores);
        dataServidores  = await response.json();
        console.log(dataServidores)
  });
  
  

  async function crearJugador() {
    const response= await fetch(apiURLAddJugador,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": selected,
              "nombre_jugador": nombreJugadorNuevo
            })
        });
    //const json = await response.json()
    location.href = "/#/Jugadores";
    //let result = JSON.stringify(json)
    //console.log(result)
  }

</script>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text" >
          <span class="card-title center" style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nuevo Jugador</span>
        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field">
              <input style="border-radius: 20px" bind:value={nombreJugadorNuevo} id="Nombre_Jugador" type="text" class="white validate black-text"><!--bind:value setea en nombreJugador el valor del input-->
              <label  class="active" for="Nombre_Jugador">Nombre Invocador</label>
            </div>
          </div>
          
          <div class="container">
            <div class="row input-field">       
                <select  bind:value={selected} id="Servidores" class="browser-default"><!--bind:value setea en selected el valor(id) del item seleccionado-->
                  <option value="" disabled selected>Servidor</option>
                  {#each dataServidores as servidor }
                  <option value={servidor.id_servidor}>{servidor.region_servidor}</option> <!--value ={servidor.id_servidor} setea el id del servidor en selected en base al item seleccionado-->
                  {/each}
                </select>
                <label class="active" for="Servidores"> Nombre Servidor</label>
            </div>
          </div>
          <div class = "container">
            <button class ="waves-effect waves-light btn deep- blue darken-1" on:click={()=> crearJugador()}><i class="material-icons left white-text">check_circle</i>Agregar</button> 
          </div>
        </div>
      </div>
    </div>
  </div>
</body>



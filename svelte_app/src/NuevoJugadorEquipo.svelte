<script>
    import { onMount } from "svelte";
    export let params
    let idEquipo = params.ID_Equipo // para la url de la api
    let selected;
    const apiURLAddJugadorEquipo = "http://127.0.0.1:5000/add_equi_juga";
    const apiURLGetEquipo = "http://127.0.0.1:5000/get_equipo/";
    const apiURLGetJugadores = "http://127.0.0.1:5000/get_jugadores";
    let dataJugadores = []; // estructura que va a almacenar el json de la respuesta de la api
    let dataEquipo = [];
    //onMount ejecuta la funcion al principio               <a style="color:white" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> inscribirEquipoTorneo()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>

    onMount(async function(){
        const response = await fetch(apiURLGetEquipo+idEquipo)
        dataEquipo = await response.json();
        console.log(dataEquipo);
    });

    onMount(async function() {
        const response = await fetch(apiURLGetJugadores);
        dataJugadores = await response.json();
        console.log(dataJugadores)
    });

    async function agregarJugadorEquipo() {
    const response= await fetch(apiURLAddJugadorEquipo,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": idEquipo,
              "id_jugador": selected
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    location.href = "/#/PerfilEquipo/"+idEquipo;
    console.log(result)
  }

</script>




<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
    <div class="container " style ="padding-top: 10%">
      <div class = "container">
        <div class="col s12 m4 l8 card blue-grey lighten-5">
          <div class="card-content black-text thick " >
            <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">{dataEquipo.nombre_equipo}</span>
            <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Agregar jugador al equipo:</span>
            

          </div>
          <div class="card-action">
            <div class="container">
              <div class="row input-field col s6 offset">       
                  <select  bind:value={selected} class="browser-default">
                    <option value="" disabled selected>Jugadores</option>
                    {#each dataJugadores as jugador }
                    <option value={jugador.id_jugador}>{jugador.nombre_jugador}</option>
                    {/each}
                  </select>
                  <label class="active" for="first_name "> Nombre Equipo</label>
                </div>
                <a style="color:white" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> agregarJugadorEquipo()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  </body>
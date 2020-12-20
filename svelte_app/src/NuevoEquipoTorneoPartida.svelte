<script>
  import { onMount } from "svelte";
  export let params;
  const apiURLGetEquiposTorneo = "http://127.0.0.1:5000/get_equis_torneo/";
  const apiURLGetEquipo = "http://127.0.0.1:5000/get_equipo/";
  const apiURLAddPartida = "http://127.0.0.1:5000/add_partida";
  const apiURLAddEquiTorneoPartida=  "http://127.0.0.1:5000/add_equi_torneo_partida";


  let idTorneo = params.ID_Torneo;

  
  let dataEquipos=[];

  let selectedEquipo1=null;
  let selectedEquipo2=null;
  let resultadoPartida;
  onMount(async function() {      
    let dataEquiposAux= [];           
    const response = await fetch(apiURLGetEquiposTorneo+idTorneo);// trae los equipos de un torneo
    let dataEquiposTorneo  = await response.json();
    //console.log(dataEquiposTorneo);
    //console.log(dataEquiposTorneo.length);
    for(let i = 0; i < dataEquiposTorneo.length; i++) {
      const responseEquipo = await fetch(apiURLGetEquipo+dataEquiposTorneo[i].id_equipo); // obtiene los datos de todos los equipos del torneo
      let jsonEquipo  = await responseEquipo.json();
      dataEquiposAux.push(jsonEquipo); // mete equipo por equipo 
  } 
    dataEquipos = dataEquiposAux; // svelte no reacciona push.....
    //console.log(dataEquipos);
  });

  async function insertarPartidaTorneo() {

    if (selectedEquipo1 != selectedEquipo2 && selectedEquipo1!= null && selectedEquipo2!=null ){
      const partida= await crearPartida();
      // insertamos la partida con sus dos equipos a un torneo, por eso se hace la misma consulta 2 veces
      const response= await fetch(apiURLAddEquiTorneoPartida,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": selectedEquipo1,
              "id_torneo": idTorneo,
             "id_partida": partida.id_partida
           })
       });
      //const json1 = await response.json()
     const response2= await fetch(apiURLAddEquiTorneoPartida,{
         method: 'POST', 
         headers: {'Content-Type' : 'application/json'},
         body:JSON.stringify({
           "id_equipo": selectedEquipo2,
           "id_torneo": idTorneo,
           "id_partida": partida.id_partida
         })
      });
      //const json2 = await response2.json()
      //console.log(json1);
      //console.log(json2);
      location.href = "/#/PerfilTorneo/"+idTorneo;
    }
    else
      alert("Los equipos no son validos");        
  }

  async function crearPartida() {
    console.log(resultadoPartida);
    const response= await fetch(apiURLAddPartida,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_partida": null,
              "resultado_partida": resultadoPartida
            })
        });
    const json = await response.json()
    //console.log(json);
    return json;
  }  

</script>








<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Inserte una partida al torneo</span>

        </div>
        <div class="card-action">
          <div class="container">

              <div class="row input-field col s6 offset">       
                <select  bind:value={selectedEquipo1} class="browser-default">
                  <option value="" disabled selected>Equipos</option>
                  {#each dataEquipos as equipo }
                  <option value={equipo.id_equipo}>{equipo.nombre_equipo}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Equipo 1</label>
              </div>

              <div class="row input-field col s6 offset">       
                <select  bind:value={selectedEquipo2} class="browser-default">
                  <option value="" disabled selected>Equipos</option>
                  {#each dataEquipos as equipo }
                  <option value={equipo.id_equipo}>{equipo.nombre_equipo}</option>
                  {/each}
                </select>
                <label class="active" for="first_name "> Equipo 2</label>
              </div>  

              <div class="row input-field col s6 offset ">
                <input style="border-radius: 15px" bind:value={resultadoPartida} placeholder="Por Determinar" id="first_name" type="text" class="white validate black-text">
                  <label  class="active " for="first_name ">Resultado</label>
              </div>
              <button class ="waves-effect waves-light btn  blue darken-1" on:click={()=> insertarPartidaTorneo()}><i class="material-icons left ">check_circle</i>Agregar</button>
            </div>

          
        </div>
      </div>
    </div>
  </div>
</body>
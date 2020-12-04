<script>
  import { onMount } from "svelte";
import { loop_guard } from "svelte/internal";
  export let params
  let idTorneo = params.ID_torneo
  const apiURL = "http://127.0.0.1:5000/get_equis_torneo/";
  const apiURL2 = "http://127.0.0.1:5000/get_equipo/";


  const apiUrl3 = "http://127.0.0.1:5000/get_equis_torneo_partidas/" // obtener valores filtrado de equis_torne_partida
  const apiURL4= "http://127.0.0.1:5000/get_partida/" // obtener partida

  let dataEquipos = [];
  let dataEquiposTorneo = [];
  let dataEquiposAux =[];
  let dataEquiposTorneoPartida = [];

  let dataEquiposPartidaAux= [];

  
  let dataTodo = [];
    onMount(async function() {

        const response = await fetch(apiURL+idTorneo);
        let json  = await response.json();
        dataEquiposTorneo = json;
        //console.log(dataEquiposTorneo);
        //console.log(dataEquiposTorneo.length);
        for(let i = 0; i < dataEquiposTorneo.length; i++) {
          const response2 = await fetch(apiURL2+dataEquiposTorneo[i].id_equipo);
          let json2  = await response2.json();
          dataEquiposAux.push(json2);
        } 
        dataEquipos = dataEquiposAux; // svelte no reacciona push.....
    });
    
    onMount(async function() {
      const response = await fetch(apiUrl3+idTorneo);
      let json  = await response.json();
      dataEquiposTorneoPartida = json;
      dataEquiposTorneoPartida.sort(GetSortOrder("id_partida"));
      console.log(dataEquiposTorneoPartida);
      for(let i = 0; i < dataEquiposTorneoPartida.length; i = i+2) {
        let dataTodoAux = {};
        const response2 = await fetch(apiURL2+dataEquiposTorneoPartida[i].id_equipo);
        let json2  = await response2.json();
        //console.log(json2);//equipo 1  
        const response3 = await fetch(apiURL2+dataEquiposTorneoPartida[i+1].id_equipo);
        let json3  = await response3.json();
        //console.log(json3);//equipo 2  
        const response4 = await fetch(apiURL4+dataEquiposTorneoPartida[i].id_partida);
        let json4 =  await response4.json();
        dataTodoAux.resultado_partida = json4.resultado_partida;
        dataTodoAux.equipo1 = json2.nombre_equipo;
        dataTodoAux.equipo2 = json3.nombre_equipo;
        dataEquiposPartidaAux.push(dataTodoAux);
       
      } 
      dataTodo = dataEquiposPartidaAux;
    });

    function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}


</script>

<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">

  <div class="container" style="padding-top:7%">  
    <table class="highlight centered ">
      <thead class="blue darken-1 white-text">
        <tr>
          <th >Equipo</th>
        </tr>
      </thead>
      <!-- <tbody class ="blue-grey lighten-4">-->   
      <tbody style = "background: rgba(0,0,0,0.5);">
        {#each dataEquipos as row}
          <tr>
          <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo}">{row.nombre_equipo}</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <a href="/#/NuevoJugador" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
  </div>

  <div class="container" style="padding-top:7%">  
    <table class="highlight centered ">
      <thead class="blue darken-1 white-text">
        <tr>
          
          <th >Resultado</th>
          <th >Equipo 1</th>
          <th >Equipo 2</th>
          <th></th>
        </tr>
      </thead>
      <!-- <tbody class ="blue-grey lighten-4">-->   
      <tbody style = "background: rgba(0,0,0,0.5);">
        {#each dataTodo as row}
          <tr>
          <td class="blue-text">{row.resultado_partida}</td>
          <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo}">{row.equipo1}</a></td> 
          <td class="blue-text"><a href="/#/PerfilEquipo/{row.id_equipo}">{row.equipo2}</a></td>
          <td><a href="/#/EditarJugador/{row.id_jugador}"><i class="material-icons left blue-text">edit</i></a></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <a href="/#/NuevoJugador" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
  </div>

</body>
              









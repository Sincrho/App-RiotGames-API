<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
  export let params
  import { onMount } from "svelte";

  const apiURLGetPerfilRiot = "http://127.0.0.1:5000/get_perfil/";
  let dataPerfil =[];  
  let parametros = [];
 
  // a la url de esta pagina le pasamos concatenado los dos parametros como uno solo (LA1*BNarco), y despues los dividimos con split y los metemos en el vector parametros
  let ParametroCompleto = params.ID_Servidor; 
  parametros = ParametroCompleto.split("*");
  


  onMount(async function() {
           const response = await fetch(apiURLGetPerfilRiot+parametros[0]+"/"+parametros[1]);
           let json  = await response.json();
           dataPerfil = JSON.parse(json);
           //console.log(dataPerfil)
      });
      
    
  function obtenerImagen(rango){
    let ImagenRango="";
    switch(rango) {
      case "IRON":
        ImagenRango = "https://i.imgur.com/dONSpQ1.png"
        break;
      case "BRONZE":
        ImagenRango = "https://i.imgur.com/OO2iZ5e.png"
        break;
      case "SILVER":
        ImagenRango = "https://i.imgur.com/K6Egl6R.png"
        break;
      case "GOLD":
        ImagenRango = "https://i.imgur.com/2oJvJ30.png"
        break;
      case "PLATINUM":
        ImagenRango = "https://i.imgur.com/axJyRwY.png"
        break;
      case "DIAMOND":
        ImagenRango = "https://i.imgur.com/V7fWTbS.png"
        break;
      case "MASTER":
        ImagenRango = "https://i.imgur.com/G9iX9pf.png"
        break;
      case "GRANDMASTER":
        ImagenRango = "https://i.imgur.com/MAQhZJI.png"
        break;
      case "CHALLENGER":
        ImagenRango = "https://i.imgur.com/QcvJWlV.png"
        break;
      default: 
        ImagenRango = "https://i.imgur.com/KpSAlVF.png"
    }

    return ImagenRango;
  }
  
</script>

<!--
<main>
  <body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
    <div class="container">

      <div class=" card blue-grey lighten-5" >
      
          <div class="card-content ">
           <h1>{parametros[1]} </h1>
          </div>
         
           {#each  dataPerfil as perfil } 
              
                  <div style="text-align: center; display:inline;" class = "col s12 m6">
                    <img alt src={obtenerImagen(perfil.tier)}>

                    <span style="display:block"  class="flow-text">{"Rango: "+perfil.tier +"   "+ perfil.rank+"\n"}</span>
                    <span style="display:block"  class="flow-text">{"Wins: "+perfil.wins +"   "+"Losses:  " +perfil.losses+"\n"}</span>
                  </div>
             
            {/each}
      </div>
    </div>
   
  </body>
</main>-->


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container">
    
      <div class=" card blue-grey lighten-5" >
     
        <div class="card-content ">
         <h1>{parametros[1]} </h1>
        </div>
        

        <div class = "row" >

         {#each dataPerfil as perfil }
             <div style="text-align: center;" class = "container col s6">
               <img alt src={obtenerImagen(perfil.tier)}>
             </div>
         {/each}
       </div>

    
        <div class="card-content" >
          <div class ="row " >

          

            {#each dataPerfil as perfil }
              <div style="text-align: center;" class="col s6" >
                <span align="center" class="centered flow-text">{"Rango: "+perfil.tier +"   "+ perfil.rank+"\n"}</span>
              </div>
            {/each}
          </div> 

          <div class= "row ">
              {#each dataPerfil as perfil }
                <div style="text-align: center;" class="col s6">
                  <span align="center" class="centered flow-text">{"Wins: "+perfil.wins +"   "+"Losses:  " +perfil.losses+"\n"}</span>
                </div>
              {/each}

          </div> 
          
        </div>
      </div>
   
  </div>
</body>








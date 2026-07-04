const canvas = document.getElementById("ventasChart");

if(canvas){

    new Chart(canvas,{

        type:"bar",

        data:{

            labels:[
                "Ventas"
            ],

            datasets:[{

                label:"Total",

                data:[
                    dashboardData.ventas
                ],

                backgroundColor:"#6b4423",

                borderRadius:10

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                y:{

                    beginAtZero:true

                }

            }

        }

    });

}
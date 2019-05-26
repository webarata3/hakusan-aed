port module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)


port initMap : { mapId : String, viewCount : Int } -> Cmd msg


port receiveDistances : (List Distance -> msg) -> Sub msg



-- Model


type alias Model =
    { distances : List Distance
    }


type alias Distance =
    { location :
        { latitude : Float
        , longitude : Float
        , name : String
        , place : String
        , address : String
        , tel : String
        }
    , distance : Float
    }


type Msg
    = ReceiveDistances (List Distance)


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { distances = []
      }
    , initMap
        { mapId = "map"
        , viewCount = 5
        }
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ receiveDistances ReceiveDistances ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceiveDistances distances ->
            ( { model | distances = distances }, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    article []
        [ div [ id "map" ] []
        , div [] (List.map viewDistance model.distances)
        ]


viewDistance : Distance -> Html msg
viewDistance distance =
    div []
        [ div [] [ text distance.location.name ]
        , div [] [ text distance.location.place ]
        , div [] [ text distance.location.address ]
        , div [] [ text distance.location.tel ]
        ]

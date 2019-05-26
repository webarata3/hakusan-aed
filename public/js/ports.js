((app) => {
  'use strict';

  const INIT_LATITUDE = 36.5144299;
  const INIT_LONGITUDE = 136.5634357;
  const ZOOM = 18;
  const CURRENT_POSITION_MARKER = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

  app.ports.initMap.subscribe(param => {
    const map = new google.maps.Map(document.querySelector(`#${param.mapId}`), {
      zoom: ZOOM,
      center: new google.maps.LatLng(INIT_LATITUDE, INIT_LONGITUDE),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    const infowindow = new google.maps.InfoWindow;
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.latitude, location.longitude),
        map: map
      });
      marker.addListener('click', () => {
        infowindow.setContent(location.name);
        infowindow.open(map, marker);
      });
    });

    getPosition(map, param.viewCount);
  });

  function getPosition(map, viewCount) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
          map: map,
          icon: CURRENT_POSITION_MARKER
        });

        map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

        // 2点間の距離をすべて計算する
        const distances = [];
        locations.forEach((location, index) => {
          distances.push({
            location: location,
            distance: distance(position.coords.latitude, position.coords.longitude,
              location.latitude, location.longitude)
          });
        });
        distances.sort((a, b) => {
          return a.distance - b.distance;
        });

        app.ports.receiveDistances.send(distances.slice(0, viewCount));
      },
      positionError => {
        switch (positionError.code) {
          case PERMISSION_DENIED:
            alert("位置情報の利用が許可されていません");
            break;
          case POSITION_UNAVAILABLE:
            alert("現在位置が取得できませんでした");
            break;
          case TIMEOUT:
            alert("タイムアウトになりました");
            break;
          default:
            alert("その他のエラー(エラーコード:" + positionError.code + ")");
            break;
        }
      }
    );
  }

  function deg2rad(degree) {
    return degree * (Math.PI / 180);
  }

  /**
   * https://qiita.com/chiyoyo/items/b10bd3864f3ce5c56291
   * より
   * ２地点間の距離(m)を求める
   * ヒュベニの公式から求めるバージョン
   *
   * @param float $lat1 緯度１
   * @param float $lon1 経度１
   * @param float $lat2 緯度２
   * @param float $lon2 経度２
   * @param boolean $mode 測地系 true:世界(default) false:日本
   * @return float 距離(m)
   */
  function distance($lat1, $lon1, $lat2, $lon2, $mode = true) {
    // 緯度経度をラジアンに変換
    const $radLat1 = deg2rad($lat1); // 緯度１
    const $radLon1 = deg2rad($lon1); // 経度１
    const $radLat2 = deg2rad($lat2); // 緯度２
    const $radLon2 = deg2rad($lon2); // 経度２

    // 緯度差
    const $radLatDiff = $radLat1 - $radLat2;

    // 経度差算
    const $radLonDiff = $radLon1 - $radLon2;

    // 平均緯度
    const $radLatAve = ($radLat1 + $radLat2) / 2.0;

    // 測地系による値の違い
    const $a = $mode ? 6378137.0 : 6377397.155; // 赤道半径
    const $b = $mode ? 6356752.314140356 : 6356078.963; // 極半径
    //$e2 = ($a*$a - $b*$b) / ($a*$a);
    const $e2 = $mode ? 0.00669438002301188 : 0.00667436061028297; // 第一離心率^2
    //$a1e2 = $a * (1 - $e2);
    const $a1e2 = $mode ? 6335439.32708317 : 6334832.10663254; // 赤道上の子午線曲率半径

    const $sinLat = Math.sin($radLatAve);
    const $W2 = 1.0 - $e2 * ($sinLat * $sinLat);
    const $M = $a1e2 / (Math.sqrt($W2) * $W2); // 子午線曲率半径M
    const $N = $a / Math.sqrt($W2); // 卯酉線曲率半径

    const $t1 = $M * $radLatDiff;
    const $t2 = $N * Math.cos($radLatAve) * $radLonDiff;
    const $dist = Math.sqrt(($t1 * $t1) + ($t2 * $t2));

    return $dist;
  }
})(app);

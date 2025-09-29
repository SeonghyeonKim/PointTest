# Walkway Point Matching Algorithm

<br />

## How to run

```
npm i
npm run dev
```

<br />

## 개요

이 프로젝트는 사용자의 실제 이동 좌표(내 좌표)를 **길 코스(Walkway) 포인트**와 매칭하여 특정 조건을 만족하면 해당 포인트를 완료 처리(`isCompletedPoint = true`)하는 알고리즘을 구현한다. 또한, 단순 거리 조건뿐만 아니라 **선분 거리**, **각도 기반 보정 가중치**까지 고려하여 보다 정교한 매칭이 가능하다.

---

<br />

## 데이터 구조

### WalkwayPointDTO

- `id`: 고유 ID
- `walkwayId`: 코스 ID
- `latitude`, `longitude`: 좌표
- `pointSeq`: 코스 내 순서
- `pointId`: 포인트 식별자
- `pointRadius`: 반경
- `isCompletedPoint`: 완료 여부
- `completeTime`: 완료된 시각 (timestamp)
- `required`: 필수 여부
- `weight`: 누적 가중치

### MyPoint

- `latitude`, `longitude`: 내 좌표
- `seq`: 내 좌표 순서 (시간 흐름)

---

<br />

## 알고리즘 로직

### 1. 점-점 거리 조건

- 내 좌표와 포인트 사이의 거리가 임계값 `threshold` 이하라면 해당 포인트는 즉시 완료 처리된다.
- `isCompletedPoint = true`, `completeTime = 현재 시각` 으로 기록한다.

### 2. 점-선분 거리 조건

- 연속된 포인트 간 선분과 내 좌표 사이의 수선의 발을 구한다.
- 내 좌표가 선분까지의 거리 `d`가 임계값 `threshold` 이하인 경우에만 가중치 계산을 진행한다.
- 임계값을 초과하면 스킵한다.

### 3. 가중치 계산 방식

- 기본 가중치 = `greenThreshold * (현재 포인트에서 수선의 발까지 거리 / 포인트 간 총 거리)`
- 내 좌표 이동 벡터와 walkway 선분 벡터의 **각도(angle)** 에 따른 보정 계수 적용:
  - 0° ~ 30° → `× 1.0`
  - 30° ~ 60° → `× 0.7`
  - 60° ~ 90° → `× 0.3`
- 보정된 가중치를 해당 포인트의 `weight`에 누적한다.

### 4. 완료 처리 조건

- 포인트의 누적 `weight >= greenThreshold` 인 경우 완료 처리한다.
- `isCompletedPoint = true`, `completeTime = 현재 시각` 으로 갱신한다.

---

<br />

## 핵심 함수

- **distance(a, b)**: 두 점 사이 거리 계산.
- **footOfPerpendicular(p, v, w)**: 점 `p`에서 선분 `vw`로 내린 수선의 발 좌표.
- **angleBetween(u, v)**: 두 벡터 사이의 각도를 항상 0° ~ 90° 범위의 예각으로 반환.
- **angleFactor(angle)**: 각도에 따른 보정 계수 반환.
- **updateCompletedPoints(myPoints, pointList, threshold, greenThreshold)**:
  - 전체 로직을 수행하여 pointList를 업데이트.

---

## 확장 아이디어

- Haversine 공식 적용하여 지구 곡률 반영.
- 가중치 정책을 동적으로 조정 가능하도록 설정.

<br />
<br />
<br />

# 대체 가중치 알고리즘 제안 (시뮬레이션 포함)

## 1. 지수 감쇠(Exponential Decay)

- **수식**:
  ```
  weight = baseWeight * exp(-α * d)
  ```
- **시뮬레이션 그래프**:
  ![Exponential Decay](https://quickchart.io/chart?c={type:'line',data:{labels:[0,1,2,3,4,5],datasets:[{label:'α=0.5',data:[1,0.61,0.37,0.22,0.14,0.08]}]}})

---

## 2. 가우시안 분포(Gaussian Weight)

- **수식**:
  ```
  weight = baseWeight * exp(-(d^2) / (2 * σ^2))
  ```
- **시뮬레이션 그래프**:
  ![Gaussian](https://quickchart.io/chart?c={type:'line',data:{labels:[-3,-2,-1,0,1,2,3],datasets:[{label:'σ=1',data:[0.01,0.14,0.61,1,0.61,0.14,0.01]}]}})

---

## 3. 선형 감쇠(Linear Decay)

- **수식**:
  ```
  weight = baseWeight * max(0, (threshold - d) / threshold)
  ```
- **시뮬레이션 그래프**:
  ![Linear](https://quickchart.io/chart?c={type:'line',data:{labels:[0,1,2,3,4,5],datasets:[{label:'threshold=5',data:[1,0.8,0.6,0.4,0.2,0]}]}})

---

## 4. 거리 역수(Inverse Distance)

- **수식**:
  ```
  weight = baseWeight / (d + ε)^p
  ```
- **시뮬레이션 그래프**:
  ![Inverse Distance](https://quickchart.io/chart?c={type:'line',data:{labels:[1,2,3,4,5],datasets:[{label:'p=2',data:[1,0.25,0.11,0.06,0.04]}]}})

---

## 5. 로지스틱 함수(Logistic Function)

- **수식**:
  ```
  weight = baseWeight / (1 + exp(β * (d - threshold)))
  ```
- **시뮬레이션 그래프**:
  ![Logistic](https://quickchart.io/chart?c={type:'line',data:{labels:[0,1,2,3,4,5,6,7,8,9,10],datasets:[{label:'β=1, threshold=5',data:[0.99,0.98,0.95,0.88,0.73,0.5,0.27,0.12,0.05,0.02,0.01]}]}})

---

## 6. 각도 기반 보정 확장

- **수식**:
  ```
  factor = cos(angle in rad)
  ```
- **시뮬레이션 그래프**:
  ![Cosine Factor](<https://quickchart.io/chart?c={type:'line',data:{labels:[0,15,30,45,60,75,90],datasets:[{label:'cos(angle)',data:[1,0.97,0.87,0.71,0.5,0.26,0]}]}}>)

---

<br />
<br />

# 각도 기반 가중치 보정 (시뮬레이션 포함)

## 1. 단계별 계수 방식

- **설정 값**:

  - 0° ~ 30° → `× 1.0`
  - 30° ~ 60° → `× 0.7`
  - 60° ~ 90° → `× 0.3`

- **시뮬레이션 그래프**:
  ![Step Angle Factor](https://quickchart.io/chart?c={type:'line',data:{labels:[0,15,30,45,60,75,90],datasets:[{label:'Step Factor',data:[1,1,1,0.7,0.7,0.3,0.3]}]}})

---

## 2. 코사인 기반 연속 함수

- **수식**:
  ```
  factor = cos(angle in rad)
  ```
- **특징**: 각도가 0°일 때 최대(1.0), 90°에 가까울수록 0에 수렴.

- **시뮬레이션 그래프**:
  ![Cosine Factor](<https://quickchart.io/chart?c={type:'line',data:{labels:[0,15,30,45,60,75,90],datasets:[{label:'cos(angle)',data:[1,0.97,0.87,0.71,0.5,0.26,0]}]}}>)

---

## 3. 선형 감소 방식

- **수식**:
  ```
  factor = max(0, (90 - angle) / 90)
  ```
- **특징**: 0°에서 1.0, 90°에서 0.0으로 선형 감소.

- **시뮬레이션 그래프**:
  ![Linear Angle Factor](https://quickchart.io/chart?c={type:'line',data:{labels:[0,15,30,45,60,75,90],datasets:[{label:'Linear',data:[1,0.83,0.67,0.5,0.33,0.17,0]}]}})

---

## 4. 로지스틱 함수 기반

- **수식**:
  ```
  factor = 1 / (1 + exp(β * (angle - 45)))
  ```
- **특징**: 45°를 중심으로 급격히 변화. β 값으로 곡선 조정.

- **시뮬레이션 그래프**:
  ![Logistic Angle Factor](https://quickchart.io/chart?c={type:'line',data:{labels:[0,15,30,45,60,75,90],datasets:[{label:'β=0.1',data:[0.73,0.69,0.64,0.5,0.36,0.26,0.18]}]}})

---

<br />
<br />

### Kotlin

```kotlin
import kotlin.math.*

data class WalkwayPointDTO(
    var id: Int = 0,
    var walkwayId: Long = 0,
    var latitude: Double = 0.0,
    var longitude: Double = 0.0,
    var pointSeq: Int = 0,
    var pointId: String = "",
    var pointRadius: Int = 0,
    var isCompletedPoint: Boolean = false,
    var completeTime: Long = 0L,
    var required: Int = 0,
    var weight: Double = 0.0
)

data class MyPoint(
    val latitude: Double,
    val longitude: Double,
    val seq: Int
)

// 두 점 사이 거리 (단순 유클리드)
fun distance(aLat: Double, aLon: Double, bLat: Double, bLon: Double): Double {
    val dx = aLat - bLat
    val dy = aLon - bLon
    return sqrt(dx * dx + dy * dy)
}

// p에서 선분 vw까지 수선의 발 좌표 구하기
fun footOfPerpendicular(
    px: Double, py: Double,
    vx: Double, vy: Double,
    wx: Double, wy: Double
): Pair<Double, Double> {
    val vxw = wx - vx
    val vyw = wy - vy
    val len2 = vxw * vxw + vyw * vyw
    if (len2 == 0.0) return Pair(vx, vy)

    val tRaw = ((px - vx) * vxw + (py - vy) * vyw) / len2
    val t = max(0.0, min(1.0, tRaw))

    return Pair(vx + t * vxw, vy + t * vyw)
}

// 두 벡터 사이의 각도 (항상 예각)
fun angleBetween(ax: Double, ay: Double, bx: Double, by: Double): Double {
    val dot = ax * bx + ay * by
    val normA = sqrt(ax * ax + ay * ay)
    val normB = sqrt(bx * bx + by * by)
    if (normA == 0.0 || normB == 0.0) return 0.0
    val cosTheta = (dot / (normA * normB)).coerceIn(-1.0, 1.0)
    var deg = acos(cosTheta) * 180 / Math.PI
    if (deg > 90) deg = 180 - deg
    return deg
}

// angle에 따른 보정 계수
fun angleFactor(angle: Double): Double {
    return when {
        angle <= 30 -> 1.0
        angle <= 60 -> 0.7
        else -> 0.3
    }
}

fun updateCompletedPoints(
    myPoints: MutableList<MyPoint>,
    pointList: MutableList<WalkwayPointDTO>,
    threshold: Double,
    greenThreshold: Double
): MutableList<WalkwayPointDTO> {
    if (myPoints.isEmpty()) return pointList

    val current = myPoints.last()
    val prev = if (myPoints.size >= 2) myPoints[myPoints.size - 2] else null

    for ((idx, p) in pointList.withIndex()) {
        if (p.isCompletedPoint) continue

        // 1) 점-점 거리 검사
        val d = distance(current.latitude, current.longitude, p.latitude, p.longitude)
        if (d <= threshold) {
            p.isCompletedPoint = true
            p.completeTime = System.currentTimeMillis()
            continue
        }

        // 2) 이전 point와 선분 검사
        if (idx - 1 >= 0) {
            val prevP = pointList[idx - 1]
            val (fx, fy) = footOfPerpendicular(
                current.latitude, current.longitude,
                prevP.latitude, prevP.longitude,
                p.latitude, p.longitude
            )
            val fd = distance(current.latitude, current.longitude, fx, fy)

            if (fd <= threshold) {
                val totalDist = distance(p.latitude, p.longitude, prevP.latitude, prevP.longitude)
                val distFromPrev = distance(fx, fy, prevP.latitude, prevP.longitude)

                val baseWeight = greenThreshold * (distFromPrev / totalDist)
                val factor = if (prev != null) {
                    val ux = current.latitude - prev.latitude
                    val uy = current.longitude - prev.longitude
                    val vx = p.latitude - prevP.latitude
                    val vy = p.longitude - prevP.longitude
                    angleFactor(angleBetween(ux, uy, vx, vy))
                } else 1.0

                p.weight += baseWeight * factor
            }
        }

        // 3) 다음 point와 선분 검사
        if (idx + 1 < pointList.size) {
            val nextP = pointList[idx + 1]
            val (fx, fy) = footOfPerpendicular(
                current.latitude, current.longitude,
                p.latitude, p.longitude,
                nextP.latitude, nextP.longitude
            )
            val fd = distance(current.latitude, current.longitude, fx, fy)

            if (fd <= threshold) {
                val totalDist = distance(p.latitude, p.longitude, nextP.latitude, nextP.longitude)
                val distFromP = distance(fx, fy, p.latitude, p.longitude)

                val baseWeight = greenThreshold * (distFromP / totalDist)
                val factor = if (prev != null) {
                    val ux = current.latitude - prev.latitude
                    val uy = current.longitude - prev.longitude
                    val vx = nextP.latitude - p.latitude
                    val vy = nextP.longitude - p.longitude
                    angleFactor(angleBetween(ux, uy, vx, vy))
                } else 1.0

                p.weight += baseWeight * factor
            }
        }

        // 4) 가중치 기준 넘으면 완료 처리
        if (p.weight >= greenThreshold) {
            p.isCompletedPoint = true
            p.completeTime = System.currentTimeMillis()
        }
    }
    return pointList
}
```

### Swift

```swift
import Foundation

struct WalkwayPointDTO {
    var id: Int = 0
    var walkwayId: Int64 = 0
    var latitude: Double = 0.0
    var longitude: Double = 0.0
    var pointSeq: Int = 0
    var pointId: String = ""
    var pointRadius: Int = 0
    var isCompletedPoint: Bool = false
    var completeTime: Int64 = 0
    var required: Int = 0
    var weight: Double = 0.0
}

struct MyPoint {
    let latitude: Double
    let longitude: Double
    let seq: Int
}

func distance(_ ax: Double, _ ay: Double, _ bx: Double, _ by: Double) -> Double {
    let dx = ax - bx
    let dy = ay - by
    return (dx * dx + dy * dy).squareRoot()
}

func footOfPerpendicular(px: Double, py: Double, vx: Double, vy: Double, wx: Double, wy: Double) -> (Double, Double) {
    let vxw = wx - vx
    let vyw = wy - vy
    let len2 = vxw * vxw + vyw * vyw
    if len2 == 0 { return (vx, vy) }

    let tRaw = ((px - vx) * vxw + (py - vy) * vyw) / len2
    let t = max(0.0, min(1.0, tRaw))

    return (vx + t * vxw, vy + t * vyw)
}

func angleBetween(ax: Double, ay: Double, bx: Double, by: Double) -> Double {
    let dot = ax * bx + ay * by
    let normA = (ax * ax + ay * ay).squareRoot()
    let normB = (bx * bx + by * by).squareRoot()
    if normA == 0 || normB == 0 { return 0 }
    let cosTheta = max(-1.0, min(1.0, dot / (normA * normB)))
    var deg = acos(cosTheta) * 180 / Double.pi
    if (deg > 90) { deg = 180 - deg }
    return deg
}

func angleFactor(_ angle: Double) -> Double {
    if angle <= 30 { return 1.0 }
    else if angle <= 60 { return 0.7 }
    else { return 0.3 }
}

func updateCompletedPoints(
    myPoints: inout [MyPoint],
    pointList: inout [WalkwayPointDTO],
    threshold: Double,
    greenThreshold: Double
) -> [WalkwayPointDTO] {
    guard let current = myPoints.last else { return pointList }
    let prev = myPoints.count >= 2 ? myPoints[myPoints.count - 2] : nil

    for idx in 0..<pointList.count {
        if pointList[idx].isCompletedPoint { continue }

        let d = distance(current.latitude, current.longitude, pointList[idx].latitude, pointList[idx].longitude)
        if d <= threshold {
            pointList[idx].isCompletedPoint = true
            pointList[idx].completeTime = Int64(Date().timeIntervalSince1970 * 1000)
            continue
        }

        if idx - 1 >= 0 {
            let prevP = pointList[idx - 1]
            let (fx, fy) = footOfPerpendicular(px: current.latitude, py: current.longitude, vx: prevP.latitude, vy: prevP.longitude, wx: pointList[idx].latitude, wy: pointList[idx].longitude)
            let fd = distance(current.latitude, current.longitude, fx, fy)

            if fd <= threshold {
                let totalDist = distance(pointList[idx].latitude, pointList[idx].longitude, prevP.latitude, prevP.longitude)
                let distFromPrev = distance(fx, fy, prevP.latitude, prevP.longitude)

                let baseWeight = greenThreshold * (distFromPrev / totalDist)
                var factor = 1.0
                if let prev = prev {
                    let ux = current.latitude - prev.latitude
                    let uy = current.longitude - prev.longitude
                    let vx = pointList[idx].latitude - prevP.latitude
                    let vy = pointList[idx].longitude - prevP.longitude
                    factor = angleFactor(angleBetween(ax: ux, ay: uy, bx: vx, by: vy))
                }
                pointList[idx].weight += baseWeight * factor
            }
        }

        if idx + 1 < pointList.count {
            let nextP = pointList[idx + 1]
            let (fx, fy) = footOfPerpendicular(px: current.latitude, py: current.longitude, vx: pointList[idx].latitude, vy: pointList[idx].longitude, wx: nextP.latitude, wy: nextP.longitude)
            let fd = distance(current.latitude, current.longitude, fx, fy)

            if fd <= threshold {
                let totalDist = distance(pointList[idx].latitude, pointList[idx].longitude, nextP.latitude, nextP.longitude)
                let distFromP = distance(fx, fy, pointList[idx].latitude, pointList[idx].longitude)

                let baseWeight = greenThreshold * (distFromP / totalDist)
                var factor = 1.0
                if let prev = prev {
                    let ux = current.latitude - prev.latitude
                    let uy = current.longitude - prev.longitude
                    let vx = nextP.latitude - pointList[idx].latitude
                    let vy = nextP.longitude - pointList[idx].longitude
                    factor = angleFactor(angleBetween(ax: ux, ay: uy, bx: vx, by: vy))
                }
                pointList[idx].weight += baseWeight * factor
            }
        }

        if pointList[idx].weight >= greenThreshold {
            pointList[idx].isCompletedPoint = true
            pointList[idx].completeTime = Int64(Date().timeIntervalSince1970 * 1000)
        }
    }
    return pointList
}
```

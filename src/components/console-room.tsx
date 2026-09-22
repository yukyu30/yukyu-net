'use client'

import { RoundedBox } from '@react-three/drei'
import { HeroAvatar } from './hero-avatar'
import { ConsoleSurface } from './console-surface'

const ROOM = {
  sky: '#9cbfe6', wall: '#d4e9dc', floor: '#ceb694', wood: '#ab7955', edge: '#74553f',
  cream: '#fff0cf', blue: '#2459c8', orange: '#f39a68', pink: '#efb6b1',
  green: '#659667', leaf: '#91b881', coffee: '#533222', screen: '#172e4c'
}

export function ConsoleRoom({ showCharacter }: { showCharacter: boolean }) {
  return <group>
    <RoundedBox args={[3.48, 4.08, 0.1]} radius={0.12} position={[0, 0.04, 0.12]}>
      <meshStandardMaterial color={ROOM.wall} roughness={0.9} />
    </RoundedBox>
    <RoundedBox args={[3.48, 0.2, 0.85]} radius={0.04} position={[0, -1.9, 0.49]}>
      <meshStandardMaterial color={ROOM.floor} roughness={0.9} />
    </RoundedBox>
    {[-1.2, -0.6, 0, 0.6, 1.2].map(x => <mesh key={x} position={[x, -1.793, 0.5]}>
      <boxGeometry args={[0.008, 0.003, 0.75]} /><meshStandardMaterial color={ROOM.wood} />
    </mesh>)}
    {/* A window with a quiet blue sky. */}
    <RoundedBox args={[1.15, 1.12, 0.08]} radius={0.04} position={[-0.85, 1.23, 0.23]}>
      <meshStandardMaterial color={ROOM.cream} roughness={0.8} />
    </RoundedBox>
    <mesh position={[-0.85, 1.23, 0.278]}><planeGeometry args={[0.97, 0.94]} /><meshBasicMaterial color={ROOM.sky} /></mesh>
    <mesh position={[-0.85, 1.23, 0.29]}><boxGeometry args={[0.045, 0.98, 0.025]} /><meshStandardMaterial color={ROOM.cream} /></mesh>
    <mesh position={[-0.85, 1.23, 0.29]}><boxGeometry args={[1, 0.045, 0.025]} /><meshStandardMaterial color={ROOM.cream} /></mesh>
    {/* Shelves and a slightly irregular row of books. */}
    {[0.64, 1.46].map(y => <group key={y} position={[0.93, y, 0.35]}>
      <RoundedBox args={[1.04, 0.075, 0.34]} radius={0.025}><meshStandardMaterial color={ROOM.wood} roughness={0.8} /></RoundedBox>
      {[ROOM.blue, ROOM.pink, ROOM.cream, ROOM.orange].map((color, i) => <RoundedBox key={color}
        args={[0.14, 0.33 + i % 2 * 0.08, 0.19]} radius={0.012}
        position={[-0.32 + i * 0.19, 0.21, 0.01]} rotation={[0, 0, i === 3 ? -0.12 : 0]}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>)}
    </group>)}
    {/* The resident sits behind a desk. */}
    <RoundedBox args={[0.6, 0.78, 0.18]} radius={0.12} position={[-0.47, -0.66, 0.37]}><meshStandardMaterial color={ROOM.blue} roughness={0.9} /></RoundedBox>
    <RoundedBox args={[0.43, 0.48, 0.29]} radius={0.12} position={[-0.47, -0.35, 0.53]}><meshStandardMaterial color={ROOM.cream} roughness={0.9} /></RoundedBox>
    {showCharacter && <ConsoleSurface position={[-0.47, 0.12, 0.64]} width={108} height={108} interactive={false} layer={12}>
      <div className="console-room__resident"><HeroAvatar showFallback={false} /></div>
    </ConsoleSurface>}
    <RoundedBox args={[2.22, 0.13, 0.76]} radius={0.055} position={[-0.24, -0.8, 0.78]}><meshStandardMaterial color={ROOM.wood} roughness={0.8} /></RoundedBox>
    {[-1.18, 0.68].map(x => <RoundedBox key={x} args={[0.085, 0.9, 0.1]} radius={0.02} position={[x, -1.31, 0.94]}><meshStandardMaterial color={ROOM.edge} roughness={0.8} /></RoundedBox>)}
    <RoundedBox args={[0.68, 0.47, 0.05]} radius={0.025} position={[-0.47, -0.49, 0.95]} rotation={[-0.1, 0, 0]}><meshStandardMaterial color={ROOM.blue} roughness={0.6} /></RoundedBox>
    <mesh position={[-0.47, -0.47, 0.986]}><planeGeometry args={[0.54, 0.31]} /><meshBasicMaterial color={ROOM.screen} /></mesh>
    <mesh position={[-0.59, -0.45, 0.99]}><planeGeometry args={[0.18, 0.025]} /><meshBasicMaterial color={ROOM.cream} /></mesh>
    <RoundedBox args={[0.71, 0.035, 0.24]} radius={0.012} position={[-0.47, -0.707, 1.04]}><meshStandardMaterial color={ROOM.blue} roughness={0.6} /></RoundedBox>
    {/* Coffee and sushi on the desktop. */}
    <group position={[-1.06, -0.61, 0.94]}>
      <mesh><cylinderGeometry args={[0.09, 0.075, 0.18, 24]} /><meshStandardMaterial color={ROOM.cream} roughness={0.6} /></mesh>
      <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.075, 24]} /><meshStandardMaterial color={ROOM.coffee} /></mesh>
      <mesh position={[0.09, 0, 0]}><torusGeometry args={[0.055, 0.017, 8, 20]} /><meshStandardMaterial color={ROOM.cream} /></mesh>
    </group>
    <RoundedBox args={[0.46, 0.025, 0.3]} radius={0.04} position={[0.43, -0.706, 0.94]}><meshStandardMaterial color={ROOM.cream} roughness={0.6} /></RoundedBox>
    {[0.31, 0.54].map(x => <group key={x} position={[x, -0.65, 0.94]}>
      <RoundedBox args={[0.16, 0.07, 0.13]} radius={0.03}><meshStandardMaterial color={ROOM.cream} /></RoundedBox>
      <RoundedBox args={[0.18, 0.04, 0.14]} radius={0.018} position={[0, 0.055, 0]}><meshStandardMaterial color={ROOM.orange} /></RoundedBox>
    </group>)}
    {/* A plant next to the desk. */}
    <group position={[1.24, -1.53, 0.51]}>
      <mesh><cylinderGeometry args={[0.19, 0.13, 0.4, 24]} /><meshStandardMaterial color={ROOM.orange} roughness={0.9} /></mesh>
      <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.018, 0.022, 0.64, 8]} /><meshStandardMaterial color={ROOM.green} /></mesh>
      {[-1, 1].flatMap(side => [0.35, 0.6].map(y => <mesh key={`${side}-${y}`} position={[side * 0.13, y, 0]} scale={[0.19, 0.09, 0.06]} rotation={[0, 0, side * 0.45]}>
        <sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={ROOM.leaf} roughness={0.9} />
      </mesh>))}
    </group>
    <pointLight position={[0, 1, 1.5]} color={ROOM.cream} intensity={1.5} distance={5} />
  </group>
}

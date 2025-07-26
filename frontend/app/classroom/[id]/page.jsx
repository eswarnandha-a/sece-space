import RoomDetail from './RoomDetail';

export default function ClassroomPage({ params }) {
  return <RoomDetail classroomId={params.id} />;
}

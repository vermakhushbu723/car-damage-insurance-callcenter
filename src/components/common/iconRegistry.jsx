import {
    AuditOutlined,
    CalendarOutlined,
    CameraOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileAddOutlined,
    FileDoneOutlined,
    FileProtectOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    FormOutlined,
    IdcardOutlined,
    LoadingOutlined,
    MailOutlined,
    MessageOutlined,
    PictureOutlined,
    ProfileOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
} from '@ant-design/icons';

/**
 * Data files reference icons by name so they stay plain JSON-ish objects.
 * Add new icons here, not in the components.
 */
const ICONS = {
    file: FileTextOutlined,
    'file-add': FileAddOutlined,
    'file-text': FileTextOutlined,
    'file-protect': FileProtectOutlined,
    'file-done': FileDoneOutlined,
    form: FormOutlined,
    'id-card': IdcardOutlined,
    'idcard-two': IdcardOutlined,
    calculator: AuditOutlined,
    picture: PictureOutlined,
    safety: SafetyCertificateOutlined,
    edit: EditOutlined,
    camera: CameraOutlined,
    solution: ProfileOutlined,
    folder: FolderOpenOutlined,
    mail: MailOutlined,
    message: MessageOutlined,
    note: EditOutlined,
    clock: ClockCircleOutlined,
    calendar: CalendarOutlined,
    send: SendOutlined,
    pending: LoadingOutlined,
};

export const getIcon = (name) => ICONS[name] || FileTextOutlined;

export default ICONS;

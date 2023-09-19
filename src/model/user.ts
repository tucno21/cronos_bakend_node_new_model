import Cronos from "../core/model/Cronos";

const User = Cronos.model('usuarios',
    {
        id: 'id',
        fillable: ['nombre', 'email', 'password', 'imagen'],
        hidden: ['password'],
        timestamps: true,
    },
);

export default User;
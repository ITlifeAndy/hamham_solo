import React, { useState, useEffect } from 'react';
import type { User } from '../../api/types';
import { userApi } from '../../api/users';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { resolveAvatarUrl } from '../../api/client';
import { useHostUrl } from '../../hooks/useHostUrl';

export const UserManagement: React.FC = () => {
  const hostUrl = useHostUrl();
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const pageSize = 10;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize, searchTerm };
      if (roleFilter !== 'All') params.role = roleFilter;
      if (isActiveFilter !== 'All') params.isActive = isActiveFilter === 'Active';

      const response = await userApi.getUsers(params);
      const resAny = response as any;
      setUsers(resAny.users || resAny.Users || []);
      setTotalCount(resAny.totalCount || resAny.TotalCount || 0);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, roleFilter, isActiveFilter]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此使用者嗎？此操作無法撤銷。')) {
      try {
        await userApi.deleteUser(id);
        loadUsers();
      } catch (err) {
        alert('刪除失敗');
      }
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h1 className="text-6xl font-bold text-black">使用者管理</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#5b76fe] text-white px-6 py-3 rounded-lg font-button-text text-button-text flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:bg-[#4a63e0] transition-all transform active:scale-95"
        >
          <span className="material-symbols-outlined">person_add</span>
          新增使用者
        </button>
      </div>

      {/* User List Card Container */}
      <div className="bg-white rounded-3xl shadow-[0_0_0_1px_rgba(224,226,232,1)] overflow-hidden">
        {/* Search & Filters */}
        <div className="p-6 border-b border-[#e9eaef] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-[#e9eaef] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-standard text-sm" 
              placeholder="以名稱、Email 或 ID 搜尋..." 
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="px-4 py-2 rounded-lg border border-[#c7cad5] text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="All">所有角色</option>
              <option value="Admin">管理員</option>
              <option value="User">使用者</option>
            </select>
            <select 
              className="px-4 py-2 rounded-lg border border-[#c7cad5] text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
              value={isActiveFilter}
              onChange={e => { setIsActiveFilter(e.target.value); setPage(1); }}
            >
              <option value="All">所有狀態</option>
              <option value="Active">已啟用</option>
              <option value="Inactive">已停用</option>
            </select>
            {/* <button className="px-4 py-2 rounded-lg border border-[#c7cad5] flex items-center justify-center gap-2 font-['Epilogue'] text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>匯出
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-surface-container-low border-b border-[#e9eaef]">
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">名稱</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest w-40 text-center">帳號</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Email</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">最後同步</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">角色</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">狀態</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-right">操作</th>
               </tr>
             </thead>

            <tbody className="divide-y divide-[#e9eaef]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">載入中...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                          {user.avatar ? (
<img 
  alt={user.name} 
  src={resolveAvatarUrl(user.avatar, hostUrl)} 
  className="w-full h-full object-cover" 
/>

                          ) : (
                            <img 
                              alt={user.name} 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-feature-label text-text-primary text-sm">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-100 px-3 py-1.5 rounded">
                        {user.username}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-body-standard text-sm text-text-secondary">{user.email}</td>
                    <td className="px-6 py-4 font-body-standard text-sm text-text-secondary">{user.lastSync || '尚未同步'}</td>
                    <td className="px-6 py-4 font-body-standard text-sm text-text-secondary">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {user.role === 'Admin' ? '管理員' : '使用者'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? '啟用' : '停用'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="material-symbols-outlined p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          edit
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="material-symbols-outlined p-2 text-slate-400 hover:text-error transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">找不到符合條件的使用者</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container-low flex items-center justify-between">
          <span className="text-sm font-body-standard text-slate-500">
            顯示 {totalCount} 位使用者中的第 {(page-1)*pageSize + 1} 到 {Math.min(page*pageSize, totalCount)} 位
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[#c7cad5] text-slate-400 hover:bg-white transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-primary text-white' : 'hover:bg-white text-slate-600'}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[#c7cad5] text-slate-600 hover:bg-white transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

       {isAddModalOpen && (
         <AddUserModal 
           isOpen={isAddModalOpen} 
           onClose={() => setIsAddModalOpen(false)} 
           onUserAdded={loadUsers} 
         />
       )}
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onUserUpdated={loadUsers} 
        user={editingUser} 
      />
    </div>
  );
};

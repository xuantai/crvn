import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChorusLogo } from './ChorusLogo';
import { Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X, LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home, Upload, MessageSquare, Send, AlertTriangle, Disc3, Bell, ChevronLeft, Mail, Palette, LayoutTemplate, GripVertical, Type, Eye, EyeOff, DollarSign, ChevronUp, ChevronDown, Volume2, Image, FileText, Compass, Smartphone, Tablet, Monitor, ArrowUp, ArrowDown, FolderOpen } from 'lucide-react';
import { getPlatformDomain, getPlatformBrandName, getArtistSubdomainUrl } from '../utils/platform';
import { compressImageInBrowser } from '../utils/imageCompressor';


interface Artist {
  artistName: string;
  username: string;
  extension: string;
  password: string;
  verified: boolean;
  isPublic?: boolean;
  dbConfig?: string;
  pendingNameChange?: string;
  pendingUsernameChange?: string;
  pendingExtensionChange?: string;
  hasExternalWebsite?: boolean;
  externalWebsiteUrl?: string;
  customDomain?: string;
  defaultLanguage?: string;
  artistBio?: string;
  isSpecial?: boolean;
  extraUsernames?: string;
  roleId?: string;
  maxSongs?: number | string;
}

const DEFAULT_TEMPLATE_NAMES: Record<string, string> = {
  '1': 'Vui vẻ (Ấm áp)',
  '2': 'Căng Cực (Sôi động)',
  '3': 'Buồn (Sâu lắng)',
  '4': 'Thư giãn (Nhẹ nhàng)',
  '5': 'Đáng yêu (Đỏ, Nhảy múa)',
  '6': 'Hạnh Phúc (Hồng, Hoa rơi)',
  '7': 'Học Đường (Trắng, Lá vàng rơi)',
  '8': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
  '9': 'Cầu Vồng',
  '10': 'Hip Hop (Đường phố)',
  '11': 'Kỳ bí (Đen vàng, Trăng khói mưa)',
  '12': 'Cổ điển (Nâu, retro)',
  '13': 'Hoàng hôn (Cam đỏ trời chiều)',
  '14': 'Đại Dương (Sóng biển)',
  '15': 'Retro 8-Bit (Game)',
  '16': 'Xếp hình Puzzle',
  '17': 'Cổ vũ (Mây, mặt trời)',
  '18': 'Pháo hoa (Năm mới)'
};

function CleanupTabContent({ token, showToast }: { token: string; showToast: (msg: string) => void }) {
  // States
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [executing, setExecuting] = useState(false);
  const [trashInfo, setTrashInfo] = useState<any>(null);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [organizing, setOrganizing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<any>(null);
  const [selectedTrashFiles, setSelectedTrashFiles] = useState<Set<string>>(new Set());
  const [restoring, setRestoring] = useState(false);
  const [expandTrash, setExpandTrash] = useState(false);

  // Load trash info on mount
  useEffect(() => { loadTrashInfo(); }, []);

  const loadTrashInfo = async () => {
    setLoadingTrash(true);
    try {
      const res = await fetch('/api/master/cleanup/trash-info', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTrashInfo(data);
    } catch (e) { console.error(e); }
    setLoadingTrash(false);
  };

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setSelectedFiles(new Set());
    try {
      const res = await fetch('/api/master/cleanup/scan', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const data = await res.json();
      setScanResult(data);
    } catch (e: any) {
      showToast('Lỗi quét: ' + (e.message || 'Unknown'));
    }
    setScanning(false);
  };

  const handleOrganize = async () => {
    if (!confirm('Sắp xếp lại file gốc?\n\nHệ thống sẽ quét tất cả file nằm trực tiếp trong uploads/ (gốc), tìm xem nghệ sĩ nào đang sử dụng, và tự động di chuyển vào đúng thư mục nghệ sĩ + cập nhật link trong database.\n\nBấm OK để tiếp tục.')) return;
    setOrganizing(true);
    setOrganizeResult(null);
    try {
      const res = await fetch('/api/master/cleanup/organize', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const data = await res.json();
      setOrganizeResult(data);
      if (data.organized > 0) {
        showToast(`Đã sắp xếp ${data.organized} file vào đúng thư mục nghệ sĩ!`);
      } else {
        showToast('Không có file nào cần sắp xếp lại.');
      }
    } catch (e: any) {
      showToast('Lỗi: ' + (e.message || 'Unknown'));
    }
    setOrganizing(false);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const toggleSelectAll = (catFiles: any[]) => {
    const paths = catFiles.map(f => f.path);
    const allSelected = paths.every(p => selectedFiles.has(p));
    setSelectedFiles(prev => {
      const next = new Set(prev);
      paths.forEach(p => allSelected ? next.delete(p) : next.add(p));
      return next;
    });
  };

  const toggleFile = (filePath: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(filePath) ? next.delete(filePath) : next.add(filePath);
      return next;
    });
  };

  const handleExecute = async () => {
    if (selectedFiles.size === 0) return;
    setExecuting(true);
    try {
      const res = await fetch('/api/master/cleanup/execute', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: Array.from(selectedFiles) })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã chuyển ${data.moved} file vào thùng rác (${formatSize(data.totalSize)})`);
        setSelectedFiles(new Set());
        handleScan(); // Re-scan
        loadTrashInfo(); // Refresh trash
      } else {
        showToast('Lỗi: ' + (data.error || 'Unknown'));
      }
    } catch (e: any) {
      showToast('Lỗi: ' + (e.message || 'Unknown'));
    }
    setExecuting(false);
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Xóa vĩnh viễn toàn bộ thùng rác? Hành động này KHÔNG thể hoàn tác!')) return;
    setEmptyingTrash(true);
    try {
      const res = await fetch('/api/master/cleanup/empty-trash', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã giải phóng ${formatSize(data.freedSize)}`);
        loadTrashInfo();
      }
    } catch (e: any) {
      showToast('Lỗi: ' + (e.message || 'Unknown'));
    }
    setEmptyingTrash(false);
  };

  const handleRestore = async () => {
    if (selectedTrashFiles.size === 0) return;
    if (!confirm(`Khôi phục ${selectedTrashFiles.size} file về vị trí gốc?`)) return;
    setRestoring(true);
    try {
      const res = await fetch('/api/master/cleanup/restore', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: Array.from(selectedTrashFiles) })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã khôi phục ${data.restored} file!`);
        setSelectedTrashFiles(new Set());
        loadTrashInfo();
      }
    } catch (e: any) {
      showToast('Lỗi: ' + (e.message || 'Unknown'));
    }
    setRestoring(false);
  };

  const handleRestoreAll = async () => {
    if (!trashInfo?.files?.length) return;
    if (!confirm(`Khôi phục TẤT CẢ ${trashInfo.totalFiles} file về vị trí gốc?`)) return;
    setRestoring(true);
    try {
      const allPaths = trashInfo.files.map((f: any) => f.path);
      const res = await fetch('/api/master/cleanup/restore', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: allPaths })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã khôi phục ${data.restored} file!`);
        setSelectedTrashFiles(new Set());
        loadTrashInfo();
      }
    } catch (e: any) {
      showToast('Lỗi: ' + (e.message || 'Unknown'));
    }
    setRestoring(false);
  };

  const toggleTrashFile = (filePath: string) => {
    setSelectedTrashFiles(prev => {
      const next = new Set(prev);
      next.has(filePath) ? next.delete(filePath) : next.add(filePath);
      return next;
    });
  };

  const toggleSelectAllTrash = () => {
    if (!trashInfo?.files?.length) return;
    const allPaths = trashInfo.files.map((f: any) => f.path);
    const allSelected = allPaths.every((p: string) => selectedTrashFiles.has(p));
    setSelectedTrashFiles(allSelected ? new Set() : new Set(allPaths));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const categoryIcons: Record<string, string> = {
    deleted_accounts: '🗑️',
    orphan_wav: '🎵',
    unused_files: '🖼️'
  };

  const categoryColors: Record<string, string> = {
    deleted_accounts: 'from-red-600 to-rose-600',
    orphan_wav: 'from-amber-600 to-orange-600', 
    unused_files: 'from-blue-600 to-indigo-600'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Trash2 className="w-7 h-7 text-rose-400" />
            Dọn dẹp Dữ liệu
          </h2>
          <p className="text-neutral-400 text-sm mt-1">Quét và xóa file rác trên server để giải phóng dung lượng</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOrganize}
            disabled={organizing || scanning}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-2xl font-black text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {organizing ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Đang sắp xếp...</>
            ) : (
              <><FolderOpen className="w-4 h-4" /> Sắp xếp file gốc</>
            )}
          </button>
          <button
            onClick={handleScan}
            disabled={scanning || organizing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-black text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {scanning ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Đang quét...</>
            ) : (
              <><Search className="w-4 h-4" /> Quét file rác</>
            )}
          </button>
        </div>
      </div>

      {/* Organize Results */}
      {organizeResult && (
        <div className="bg-neutral-900/50 border border-amber-500/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-black text-amber-400 flex items-center gap-2"><FolderOpen className="w-5 h-5" /> Kết quả sắp xếp</h3>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-emerald-400 font-bold">✅ Di chuyển: {organizeResult.organized}</span>
            <span className="text-neutral-400">⏭️ Bỏ qua: {organizeResult.skipped}</span>
            <span className="text-neutral-500">📁 Tổng: {organizeResult.total}</span>
          </div>
          {organizeResult.results && organizeResult.results.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
              {organizeResult.results.map((r: any, i: number) => (
                <div key={i} className={`text-xs font-mono px-3 py-1.5 rounded-lg ${r.action.startsWith('di chuyển') ? 'bg-emerald-500/10 text-emerald-300' : 'bg-neutral-800/50 text-neutral-500'}`}>
                  {r.file} → {r.action}{r.artist ? ` (${r.artist})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-neutral-500 font-bold uppercase">Tổng file rác</div>
                <div className="text-2xl font-black text-rose-400">{scanResult.totalFiles}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 font-bold uppercase">Dung lượng</div>
                <div className="text-2xl font-black text-amber-400">{formatSize(scanResult.totalSize)}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 font-bold uppercase">Đã chọn</div>
                <div className="text-2xl font-black text-emerald-400">{selectedFiles.size}</div>
              </div>
            </div>
            {selectedFiles.size > 0 && (
              <button
                onClick={handleExecute}
                disabled={executing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-2xl font-black text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-500/20"
              >
                {executing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Đang xử lý...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Chuyển {selectedFiles.size} file vào Thùng rác</>
                )}
              </button>
            )}
          </div>

          {/* Categories */}
          {scanResult.categories?.map((cat: any) => (
            <div key={cat.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{categoryIcons[cat.id] || '📁'}</span>
                  <span className="font-black text-sm">{cat.label}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[cat.id] || 'from-gray-600 to-gray-600'} font-bold`}>
                    {cat.files.length} files — {formatSize(cat.totalSize)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelectAll(cat.files); }}
                    className="text-xs text-neutral-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    {cat.files.every((f: any) => selectedFiles.has(f.path)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCategories.has(cat.id) ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* File list */}
              {expandedCategories.has(cat.id) && (
                <div className="border-t border-white/5 max-h-80 overflow-y-auto">
                  {cat.files.map((file: any) => (
                    <label
                      key={file.path}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/[0.02] last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={() => toggleFile(file.path)}
                        className="w-4 h-4 rounded accent-rose-500"
                      />
                      {/* Preview for images */}
                      {/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.path) ? (
                        <img src={`/${file.path}`} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                          {/\.(mp3|wav|ogg|m4a)$/i.test(file.path) ? <Volume2 className="w-4 h-4 text-neutral-500" /> : <FileText className="w-4 h-4 text-neutral-500" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-neutral-300 truncate">{file.path}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-neutral-500">{formatSize(file.size)}</span>
                          {file.ownerName && (
                            <span className="text-[10px] px-1.5 py-0 rounded-full bg-white/5 text-neutral-400 border border-white/5">👤 {file.ownerName}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {scanResult.totalFiles === 0 && (
            <div className="bg-neutral-900/50 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-black text-emerald-400">Sạch sẽ!</p>
              <p className="text-neutral-400 text-sm mt-1">Không tìm thấy file rác nào trên server.</p>
            </div>
          )}
        </div>
      )}

      {/* Trash Section */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-neutral-400" />
            Thùng rác
            {trashInfo?.totalFiles > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                {trashInfo.totalFiles} files — {formatSize(trashInfo.totalSize)}
              </span>
            )}
          </h3>
          {trashInfo?.totalFiles > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreAll}
                disabled={restoring}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-black text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {restoring ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang khôi phục...</>
                ) : (
                  <><ArrowUp className="w-3.5 h-3.5" /> Khôi phục tất cả</>
                )}
              </button>
              <button
                onClick={handleEmptyTrash}
                disabled={emptyingTrash}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl font-black text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {emptyingTrash ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang xóa...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Xóa vĩnh viễn</>
                )}
              </button>
            </div>
          )}
        </div>
        {loadingTrash ? (
          <div className="text-neutral-500 text-sm">Đang tải...</div>
        ) : trashInfo?.totalFiles > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-neutral-400 text-sm">
                Có <strong className="text-white">{trashInfo.totalFiles}</strong> file trong thùng rác, tổng <strong className="text-amber-400">{formatSize(trashInfo.totalSize)}</strong>.
              </p>
              <button
                onClick={() => setExpandTrash(!expandTrash)}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                {expandTrash ? <><ChevronUp className="w-3.5 h-3.5" /> Ẩn</> : <><ChevronDown className="w-3.5 h-3.5" /> Xem chi tiết</>}
              </button>
            </div>
            {expandTrash && (
              <div className="space-y-2">
                {/* Select all + Restore selected */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trashInfo.files.length > 0 && trashInfo.files.every((f: any) => selectedTrashFiles.has(f.path))}
                      onChange={toggleSelectAllTrash}
                      className="rounded"
                    />
                    Chọn tất cả ({trashInfo.files.length})
                  </label>
                  {selectedTrashFiles.size > 0 && (
                    <button
                      onClick={handleRestore}
                      disabled={restoring}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-black text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" /> Khôi phục {selectedTrashFiles.size} file
                    </button>
                  )}
                </div>
                {/* File list */}
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {trashInfo.files.map((file: any, i: number) => {
                    const fileName = file.path.split('/').pop();
                    const folderPath = file.path.replace('uploads/_trash/', '').replace('/' + fileName, '');
                    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);
                    return (
                      <label
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTrashFiles.has(file.path) ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-neutral-800/30 hover:bg-neutral-800/50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTrashFiles.has(file.path)}
                          onChange={() => toggleTrashFile(file.path)}
                          className="rounded flex-shrink-0"
                        />
                        {isImage && (
                          <img
                            src={'/' + file.path}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-neutral-800"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-neutral-300 truncate">{fileName}</div>
                          <div className="text-[10px] text-neutral-600 truncate">📁 {folderPath} · {formatSize(file.size)}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">Thùng rác trống.</p>
        )}
      </div>
    </div>
  );
}

export default function ACPControlPanel() {
  const showAlert = (window as any).showAlert || (async (msg: string) => window.alert(msg));

  const [token, setToken] = useState<string | null>(localStorage.getItem('masterToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [landingConfig, setLandingConfig] = useState<any>({});
  const [rolesMatrix, setRolesMatrix] = useState<any[]>([]);
  const [matrixSaving, setMatrixSaving] = useState(false);
  const [matrixMsg, setMatrixMsg] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/acp/roles-matrix', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRolesMatrix(data);
        })
        .catch(() => {});
    }
  }, [token]);

  const [actionConfirm, setActionConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isAlertOnly?: boolean;
    type?: 'confirm' | 'alert' | 'error' | 'success' | 'danger';
  } | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const showConfirm = (message: string, title = 'Xác nhận', type: 'confirm' | 'danger' | 'success' | 'alert' = 'confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setActionConfirm({
        isOpen: true,
        title,
        message,
        isAlertOnly: type === 'alert',
        type,
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });
  };

  const location = useLocation();
  const navigate = useNavigate();

  const validTabs = ['artists', 'landing', 'tickets', 'templates', 'faq', 'keywords', 'content', 'roles', 'vouchers', 'pricing', 'admin_theme', 'edit_item', 'explore', 'cleanup'];
  const urlTab = location.pathname.split('/').filter(Boolean)[1];
  const initialTab = validTabs.includes(urlTab) ? urlTab : 'artists';

  const [activeTab, setActiveTabState] = useState<any>(initialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    navigate(`/master/${tab}`);
  };

  useEffect(() => {
    const pTab = location.pathname.split('/').filter(Boolean)[1];
    if (pTab && validTabs.includes(pTab) && pTab !== activeTab) {
      setActiveTabState(pTab);
    }
  }, [location.pathname, activeTab]);

  // ─── Explore Features State ──────────────────────────────────
  const [exploreFeatures, setExploreFeatures] = useState<any[]>([]);
  const [exploreSaving, setExploreSaving] = useState(false);
  const [exploreLoaded, setExploreLoaded] = useState(false);
  const exploreFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [artistCurrentPage, setArtistCurrentPage] = useState(0);
  const [artistPageSize, setArtistPageSize] = useState<number>(20); // 20, 50, 100

  // Email states
  const [mailRecipientType, setMailRecipientType] = useState<'all' | 'verified' | 'unverified' | 'registered_after'>('all');
  const [mailRegisteredAfterDate, setMailRegisteredAfterDate] = useState('');
  const [mailTitle, setMailTitle] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailSuccess, setMailSuccess] = useState('');
  const [mailError, setMailError] = useState('');
  const [sentMails, setSentMails] = useState<any[]>([]);

  // ACP data
  const [artists, setArtists] = useState<Artist[]>([]);
  const [newArtistCreatedInfo, setNewArtistCreatedInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  // Tickets states
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [chatText, setChatText] = useState('');
  const [isHandlingTicketAction, setIsHandlingTicketAction] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

    // Edit item lookup states
  const [editLookupQuery, setEditLookupQuery] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [editSongForm, setEditSongForm] = useState<any>({
    title: '',
    slug: '',
    composer: '',
    musicProducer: '',
    singer: '',
    releaseYear: '',
    lyrics: '',
    audioUrl: '',
    coverUrl: '',
    bgUrl: '',
    template: '1',
    status: 'public',
    password: '',
    linkType: 'direct',
    linkZing: '',
    linkSpotify: '',
    linkApple: '',
    linkYoutubeMusic: '',
    linkYoutube: ''
  });
  const [editPlaylistForm, setEditPlaylistForm] = useState<any>({
    title: '',
    coverUrl: '',
    description: '',
    password: '',
    secretLink: false,
    isDraft: false,
    demoIds: [],
    availableDemos: []
  });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const detectedType = useMemo(() => {
    const q = editLookupQuery.trim().toLowerCase();
    if (q.includes('/playlist/')) return 'playlist';
    if (q.includes('/song/') || q.includes('/demo/')) return 'song';
    return null;
  }, [editLookupQuery]);

  
  const handleFileUpload = async (file: File, fieldName: 'audioUrl' | 'coverUrl' | 'bgUrl' | 'playlistCoverUrl') => {
    if (!file) return;
    setIsUploadingFile(true);
    try {
      let fileToUpload = file;
      if (file.type && file.type.startsWith('image/')) {
        fileToUpload = await compressImageInBrowser(file);
      }
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || ''}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tải file thất bại');
      const fileUrl = data.url || data.path || '';
      const thumbUrl = data.thumbUrl || fileUrl;
      if (fieldName === 'playlistCoverUrl') {
        setEditPlaylistForm((prev: any) => ({ ...prev, coverUrl: fileUrl, thumbUrl: thumbUrl }));
      } else {
        setEditSongForm((prev: any) => ({
          ...prev,
          [fieldName]: fileUrl,
          ...(fieldName === 'coverUrl' ? { thumbUrl: thumbUrl } : {})
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tải file');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult || !lookupResult.id) return;
    setIsSavingEdit(true);
    setEditSuccessMsg('');
    setLookupError('');
    try {
      const res = await fetch('/api/acp/song/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          artistExtension: lookupResult.artistExtension,
          songId: lookupResult.id,
          ...editSongForm
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật bài hát');
      setEditSuccessMsg('🎉 Cập nhật thông tin bài hát thành công!');
      setTimeout(() => setEditSuccessMsg(''), 4000);
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi cập nhật');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult || !lookupResult.id) return;
    setIsSavingEdit(true);
    setEditSuccessMsg('');
    setLookupError('');
    try {
      const res = await fetch('/api/acp/playlist/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          artistExtension: lookupResult.artistExtension,
          playlistId: lookupResult.id,
          ...editPlaylistForm
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật playlist');
      setEditSuccessMsg('🎉 Cập nhật thông tin playlist thành công!');
      setTimeout(() => setEditSuccessMsg(''), 4000);
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi cập nhật');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await fetch(`/api/acp/lookup-item?query=${encodeURIComponent(editLookupQuery.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không tìm thấy bài hát hoặc playlist');
      }
            setLookupResult(data);
      if (data.type === 'song') {
        setEditSongForm({
          title: data.title || '',
          slug: data.slug || '',
          composer: data.composer || '',
          musicProducer: data.musicProducer || '',
          singer: data.singer || '',
          releaseYear: data.releaseYear || '',
          lyrics: data.lyrics || '',
          audioUrl: data.audioUrl || '',
          coverUrl: data.coverUrl || '',
          bgUrl: data.bgUrl || '',
          template: data.template || '1',
          status: data.status || 'public',
          password: data.password || '',
          linkType: data.linkType || 'direct',
          linkZing: data.linkZing || '',
          linkSpotify: data.linkSpotify || '',
          linkApple: data.linkApple || '',
          linkYoutubeMusic: data.linkYoutubeMusic || '',
          linkYoutube: data.linkYoutube || ''
        });
      } else if (data.type === 'playlist') {
        setEditPlaylistForm({
          title: data.title || '',
          coverUrl: data.coverUrl || '',
          description: data.description || '',
          password: (data.password === true || data.password === 'true') ? '' : (data.password || ''),
          secretLink: typeof data.secretLink === 'string' ? data.secretLink : '',
          isDraft: !!data.isDraft,
          demoIds: data.demoIds || [],
          availableDemos: data.availableDemos || []
        });
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi tìm kiếm');
    } finally {
      setIsLookingUp(false);
    }
  };

// Pricing state
  const [pricingSettings, setPricingSettings] = useState<any>({
    free: { monthlyOriginalPrice: 0, monthlySalePrice: 0, yearlyOriginalPrice: 0, yearlySalePrice: 0, features: [] },
    pro: { monthlyOriginalPrice: 150000, monthlySalePrice: 99000, yearlyOriginalPrice: 1800000, yearlySalePrice: 890000, features: [] },
    vip: { monthlyOriginalPrice: 350000, monthlySalePrice: 249000, yearlyOriginalPrice: 4200000, yearlySalePrice: 1990000, features: [] }
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingMsg, setPricingMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  useEffect(() => {
    if (token && activeTab === 'pricing') {
      fetch('/api/acp/pricing', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setPricingSettings(data);
      })
      .catch(() => {});
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  // Form states (Artist)
  const [artistName, setArtistName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistUsername, setArtistUsername] = useState('');
  const [artistExtension, setArtistExtension] = useState('');
  const [artistPassword, setArtistPassword] = useState('');
  const [artistVerified, setArtistVerified] = useState(true);
  const [artistIsPublic, setArtistIsPublic] = useState(true);
  const [artistDbConfig, setArtistDbConfig] = useState('');
  const [artistHasExternalWebsite, setArtistHasExternalWebsite] = useState(false);
  const [artistExternalWebsiteUrl, setArtistExternalWebsiteUrl] = useState('');
  const [formErr, setFormErr] = useState('');
  const [artistDefaultLanguage, setArtistDefaultLanguage] = useState('vi');
  const [isTranslatingArtist, setIsTranslatingArtist] = useState(false);
  const [artistBio, setArtistBio] = useState('');
  const [artistIsSpecial, setArtistIsSpecial] = useState(false);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  // Form states (Landing Config)
  const [landingTagline, setLandingTagline] = useState('');
  const [landingHeroTitle, setLandingHeroTitle] = useState('');
  const [landingHeroSubtitle, setLandingHeroSubtitle] = useState('');
  const [landingHeroDesc, setLandingHeroDesc] = useState('');
  const [landingFooterText, setLandingFooterText] = useState('');
  const [showArtistsSection, setShowArtistsSection] = useState<boolean>(true);
  const [systemIp, setSystemIp] = useState('');
  const [adminUsername, setAdminUsername] = useState('acxuantai');
  const [adminPassword, setAdminPassword] = useState('MatKhauDay123');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [defaultAdminTheme, setDefaultAdminTheme] = useState<'liquid-glass' | 'gold'>('liquid-glass');
  const [templateNames, setTemplateNames] = useState<Record<string, string>>({});
  const [templateVip, setTemplateVip] = useState<Record<string, boolean>>({});
  const [adminThemesVip, setAdminThemesVip] = useState<Record<string, boolean>>({ 'liquid-glass': false, 'gold': true });
  const [demoSongTitle, setDemoSongTitle] = useState("");
  const [demoSongArtist, setDemoSongArtist] = useState("");
  const [demoSongLyrics, setDemoSongLyrics] = useState("");

  // Metadata & Custom sharing states
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingOgImageUrl, setLandingOgImageUrl] = useState('');
  const [landingFaviconUrl, setLandingFaviconUrl] = useState('');
  const [faviconProgress, setFaviconProgress] = useState(0);
  const [ogImageProgress, setOgImageProgress] = useState(0);
  
  // Feature section states
  const [feature1Title, setFeature1Title] = useState('');
  const [feature1Desc, setFeature1Desc] = useState('');
  const [feature2Title, setFeature2Title] = useState('');
  const [feature2Desc, setFeature2Desc] = useState('');
  const [feature3Title, setFeature3Title] = useState('');
  const [feature3Desc, setFeature3Desc] = useState('');
  const [feature4Title, setFeature4Title] = useState('');
  const [feature4Desc, setFeature4Desc] = useState('');
  
  // Interface labels
  const [menuVaultVi, setMenuVaultVi] = useState('Kho Nhạc');
  const [menuAboutVi, setMenuAboutVi] = useState('Về Tôi');
  const [menuBioVi, setMenuBioVi] = useState('Tiểu Sử');
  const [featuresTitle, setFeaturesTitle] = useState('');
  const [featuresSub, setFeaturesSub] = useState('');
  const [globalLayoutSections, setGlobalLayoutSections] = useState<string[]>(['title', 'spotify', 'vault', 'mv']);
  const [statusBadge, setStatusBadge] = useState('');

  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [isTranslatingLanding, setIsTranslatingLanding] = useState(false);
  const [isTranslatingTemplates, setIsTranslatingTemplates] = useState(false);
  const [landingSuccessMsg, setLandingSuccessMsg] = useState('');
  const [subscribers, setSubscribers] = useState<string[]>([]);

  // FAQ & Terms States
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);

  // Forbidden Keywords States
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  // Content Management States (Flagged songs)
  const [flaggedSongs, setFlaggedSongs] = useState<any[]>([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongLyrics, setEditSongLyrics] = useState('');
  const [submittingSongEdit, setSubmittingSongEdit] = useState(false);

  // Roles & Permissions States
  const [roles, setRoles] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [editingRoleIdx, setEditingRoleIdx] = useState<number | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleMaxPosts, setRoleMaxPosts] = useState(10);
  const [roleAccessControl, setRoleAccessControl] = useState(false);
  const [roleDemoPassword, setRoleDemoPassword] = useState(false);
  const [roleSecretLink, setRoleSecretLink] = useState(false);
  const [roleCustomDomain, setRoleCustomDomain] = useState(false);
  const [roleBio, setRoleBio] = useState(false);
  const [roleAboutMe, setRoleAboutMe] = useState(false);
  const [roleUiEdit, setRoleUiEdit] = useState(false);
  const [roleExclusiveUi, setRoleExclusiveUi] = useState(false);
  const [roleDatabase, setRoleDatabase] = useState(false);
  const [roleSubscriptionPricing, setRoleSubscriptionPricing] = useState(false);
  const [rolePrice, setRolePrice] = useState('');
  const [roleDefaultTheme, setRoleDefaultTheme] = useState<'liquid-glass' | 'gold'>('liquid-glass');

  // Artist Role ID
  const [artistRoleId, setArtistRoleId] = useState('');
  const [artistMaxSongs, setArtistMaxSongs] = useState<number | ''>('');
  const [artistExtraUsernames, setArtistExtraUsernames] = useState('');

  // Password Visibility Toggle States
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showModalPass, setShowModalPass] = useState(false);

  const uploadWithProgress = (file: File, setProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${token || ''}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgress(100);
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } else reject(new Error('Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  useEffect(() => {
    if (token) {
      fetchArtists();
      fetchLandingConfig();
      fetchSubscribers();
      fetchTickets();

      const interval = setInterval(() => {
        fetchTickets();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (token && showComposeModal) {
      fetchSentMails();
    }
  }, [token, showComposeModal]);

  useEffect(() => {
    setArtistCurrentPage(0);
  }, [searchQuery, artistPageSize]);

  
  const getLayoutSectionName = (sec: string) => {
    if (sec === 'title') return "Tiêu Đề (Tên & Giới thiệu ngắn)";
    if (sec === 'spotify') return "Spotify Playlist / Album";
    if (sec === 'vault') return "Kho Nhạc (Danh sách Đề mô / Ra Rồi)";
    if (sec === 'mv') return "MV Đã Phát Hành (YouTube Videos)";
    return sec;
  };
  const handleDragStartLayout = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDropLayout = (e: any, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;
    const newList = [...globalLayoutSections];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    setGlobalLayoutSections(newList);
  };

  const fetchSentMails = async () => {
    try {
      const res = await fetch('/api/acp/sent-mails', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSentMails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/acp/artists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      } else {
        // Token might have expired
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/acp/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLandingConfig = async () => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLandingTagline(data.tagline || '');
        setLandingHeroTitle(data.heroTitle || 'Chorus');
        setLandingHeroSubtitle(data.heroSubtitle || 'Nơi những ca khúc khởi đầu.');
        setLandingHeroDesc(data.heroDescription || '');
        setLandingFooterText(data.footerText || '');
        setShowArtistsSection(data.showArtistsSection !== false);
        setSystemIp(data.systemIp || '');
        setAdminUsername(data.adminUsername || 'acxuantai');
        setAdminPassword(data.adminPassword || 'MatKhauDay123');
        setCloudSyncEnabled(data.cloudSyncEnabled !== false);
        setDefaultAdminTheme(data.defaultAdminTheme || 'liquid-glass');
        setTemplateNames(data.templateNames || {});
        setTemplateVip(data.templateVip || {});
        setAdminThemesVip(data.adminThemesVip || { 'liquid-glass': false, 'gold': true });
        setDemoSongTitle(data.demoSongInfo?.title || "");
        setDemoSongArtist(data.demoSongInfo?.artist || "");
        setDemoSongLyrics(data.demoSongInfo?.lyrics || "");
        setLandingPageTitle(data.pageTitle || '');
        setLandingOgImageUrl(data.ogImageUrl || '');
        setLandingFaviconUrl(data.faviconUrl || '');
        setStatusBadge(data.statusBadge || '');
        setFeaturesTitle(data.featuresTitle || 'Được thiết kế cho trải nghiệm đỉnh cao');
        setFeaturesSub(data.featuresSub || 'Tích hợp những công nghệ hiện đại nhất để tối ưu hóa quy trình phân phối và lưu trữ nội bộ.');
        setFeature1Title(data.feature1Title || 'Bảo mật demo & tuyển tập');
        setFeature1Desc(data.feature1Desc || 'Thiết lập mật mã cho từng tác phẩm chưa công bố, ngăn chặn nghe trộm hoặc chia sẻ trái phép. Gửi link demo bảo mật cho ca sĩ, nhạc sĩ phối khí và các đối tác đáng tin cậy.');
        setFeature2Title(data.feature2Title || 'Dịch thuật thông minh (AI Translation)');
        setFeature2Desc(data.feature2Desc || 'Nhận diện vị trí địa lý của khán giả quốc tế để hiển thị tiêu đề và nội dung mô tả sản phẩm bằng ngôn ngữ bản địa phù hợp nhất (Anh, Nhật, Trung, Hàn...).');
        setFeature3Title(data.feature3Title || 'Đồng bộ Cloud & Cache cục bộ');
        setFeature3Desc(data.feature3Desc || 'Lưu trữ dữ liệu kép trên Cloud Firestore chất lượng cao kết hợp cơ chế dự phòng cục bộ. Cam kết phát nhạc ổn định, tốc độ load nhanh ngay cả khi internet quốc tế gặp sự cố.');
        setFeature4Title(data.feature4Title || 'Bố cục mang đậm dấu ấn cá nhân');
        setFeature4Desc(data.feature4Desc || 'Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.');
        setMenuVaultVi(data.menuVaultVi || 'Kho Nhạc');
        setMenuAboutVi(data.menuAboutVi || 'Về Tôi');
        setMenuBioVi(data.menuBioVi || 'Tiểu Sử');
        setGlobalLayoutSections(data.globalLayoutSections || ['title', 'spotify', 'vault', 'mv']);
        setFaqs(data.faq || []);
        setKeywords(data.forbiddenKeywords || []);
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/acp/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleSendTicketMessage = async () => {
    if (!selectedTicket || !chatText.trim()) return;
    setIsHandlingTicketAction(true);
    try {
      const res = await fetch(`/api/acp/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: chatText })
      });
      if (res.ok) {
        const result = await res.json();
        setChatText('');
        setSelectedTicket(result.ticket);
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể gửi tin nhắn'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Mở lại yêu cầu",
      message: "Bạn có chắc chắn muốn mở lại ticket này không?",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/reopen`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã mở lại ticket thành công!");
            fetchTickets();
          } else {
            const err = await res.json();
            setToast(`Lỗi: ${err.error}`);
          }
        } catch (e) {
          console.error(e);
          setToast("Lỗi kết nối");
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };

  const handleResolveTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Từ chối yêu cầu",
      message: "Bạn có chắc chắn muốn từ chối yêu cầu và đóng ticket này?",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/resolve`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã đóng ticket thành công!");
            fetchTickets();
          } else {
            const err = await res.json();
            alert(`Lỗi: ${err.error || 'Không thể đóng ticket'}`);
          }
        } catch (e: any) {
          alert(`Lỗi: ${e.message}`);
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };
  const handleResolveTicketOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/acp/tickets/${ticketId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedTicket(result.ticket);
        setToast("Đã đóng ticket thành công!");
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể đóng ticket'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
    }
  };

  const handleAdminRemoveSong = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Gỡ bài hát",
      message: "Bạn có chắc chắn muốn GỠ bài hát này khỏi hệ thống? Quyết định này không thể hoàn tác!",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/remove-song`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã gỡ bài hát và đóng ticket!");
            fetchTickets();
          } else {
            const err = await res.json();
            alert(`Lỗi: ${err.error || 'Không thể gỡ bài hát'}`);
          }
        } catch (e: any) {
          alert(`Lỗi: ${e.message}`);
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };
  const handleAdminRemoveSongOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/acp/tickets/${ticketId}/remove-song`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedTicket(result.ticket);
        setToast("Đã ra quyết định gỡ bài hát và đóng ticket!");
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể gỡ bài hát'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/acp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('masterToken', data.token);
        setToken(data.token);
      } else {
        setLoginErr(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginErr('Không thể kết nối với máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('masterToken');
    try {
      await fetch('/api/acp/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setToken(null);
    window.location.href = '/master';
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    
    if (!artistName || !artistUsername || !artistExtension || !artistPassword || !artistEmail) {
      setFormErr('Vui lòng điền đầy đủ thông tin bắt buộc (Bao gồm Email)!');
      return;
    }

    try {
      const res = await fetch('/api/acp/artists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artistName,
          username: artistUsername,
          extension: artistExtension,
          email: artistEmail,
          password: artistPassword,
          verified: artistVerified,
          isPublic: artistIsPublic,
          dbConfig: artistDbConfig,
          hasExternalWebsite: artistHasExternalWebsite,
          externalWebsiteUrl: artistExternalWebsiteUrl,
          defaultLanguage: artistDefaultLanguage,
          artistBio,
          isSpecial: artistIsSpecial,
          roleId: artistRoleId,
          maxSongs: artistMaxSongs === '' ? null : artistMaxSongs,
          extraUsernames: artistExtraUsernames
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNewArtistCreatedInfo({
          name: artistName,
          extension: artistExtension,
          username: artistUsername,
          password: artistPassword
        });
        setShowAddModal(false);
        resetForm();
        fetchArtists();
      } else {
        setFormErr(data.error || 'Lỗi khi tạo nghệ sĩ');
      }
    } catch (err) {
      setFormErr('Lỗi kết nối máy chủ!');
    }
  };

  const handleAITranslateArtist = async () => {
    if (!editingArtist) return;
    if (!(await showConfirm('Hệ thống sẽ sử dụng AI (Gemini) để dịch phần Bio, tiêu đề trang, tên các tabs, thông tin brief/thương hiệu, tên & mô tả các danh sách phát của nghệ sĩ này sang 5 ngôn ngữ khác (Anh, Hàn, Nhật, Thái, Trung).\n\nLưu ý: Để giữ nguyên bản sắc nghệ thuật, hệ thống sẽ KHÔNG DỊCH tên bài hát, lời bài hát, tên ca sĩ và tác giả.\n\nBạn có muốn tiếp tục?', 'Dịch thuật AI', 'confirm'))) {
      return;
    }

    setIsTranslatingArtist(true);
    setFormErr('');
    try {
      const res = await fetch('/api/acp/artists/translate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editingArtist.username
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await showConfirm('Dịch thuật thành công! Toàn bộ các thông tin hỗ trợ đã được dịch sang 5 ngôn ngữ và lưu trên máy chủ.', 'Thành công', 'success');
      } else {
        setFormErr(result.error || 'Có lỗi xảy ra khi thực hiện dịch thuật AI.');
      }
    } catch (err: any) {
      setFormErr('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsTranslatingArtist(false);
    }
  };

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');

    if (!editingArtist) return;

    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUsername: editingArtist.username,
          artistName,
          extension: artistExtension,
          password: artistPassword,
          verified: artistVerified,
          isPublic: artistIsPublic,
          dbConfig: artistDbConfig,
          hasExternalWebsite: artistHasExternalWebsite,
          externalWebsiteUrl: artistExternalWebsiteUrl,
          defaultLanguage: artistDefaultLanguage,
          artistBio,
          isSpecial: artistIsSpecial,
          roleId: artistRoleId,
          extraUsernames: artistExtraUsernames
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        setEditingArtist(null);
        resetForm();
        fetchArtists();
      } else {
        setFormErr(data.error || 'Lỗi khi cập nhật nghệ sĩ');
      }
    } catch (err) {
      setFormErr('Lỗi kết nối máy chủ!');
    }
  };

  const handleSyncFirebaseData = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn đồng bộ dữ liệu của nghệ sĩ này từ Firebase cũ về Server mới?\nTất cả bài hát, danh sách phát và cấu hình trên Server của nghệ sĩ này sẽ được thay thế bằng dữ liệu từ Firebase cũ.', 'Đồng bộ Firebase', 'confirm'))) {
      return;
    }

    setIsSyncing(prev => ({ ...prev, [username]: true }));
    try {
      const res = await fetch('/api/acp/artists/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        setToast(data.message || 'Đồng bộ dữ liệu thành công!');
        setTimeout(() => setToast(''), 3000);
        setShowEditModal(false);
        setEditingArtist(null);
        resetForm();
        fetchArtists();
      } else {
        await showConfirm(data.error || 'Có lỗi xảy ra khi đồng bộ.', 'Lỗi đồng bộ', 'alert');
      }
    } catch (err: any) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi kết nối', 'alert');
    } finally {
      setIsSyncing(prev => ({ ...prev, [username]: false }));
    }
  };

  const handleApproveNameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi tên này?', 'Xác nhận duyệt'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveNameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi tên nghệ sĩ!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectNameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi tên này?', 'Xác nhận từ chối', 'danger'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectNameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi tên nghệ sĩ!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleApproveUsernameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi username này? Sẽ thay đổi đường dẫn của nghệ sĩ!', 'Xác nhận duyệt'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveUsernameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi username!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleApproveExtensionChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi Sub-domain này?', 'Xác nhận duyệt'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveExtensionChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi Sub-domain!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectExtensionChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn từ chối yêu cầu thay đổi Sub-domain này?', 'Xác nhận từ chối', 'danger'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectExtensionChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi Sub-domain!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectUsernameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi username này?', 'Xác nhận từ chối', 'danger'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectUsernameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi username!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleDeleteArtist = async (username: string) => {
    if (username === 'acxuantai') {
      await showConfirm('Không thể xóa tài khoản master acxuantai!', 'Thông báo', 'alert');
      return;
    }
    if (!(await showConfirm(`Bạn có chắc chắn muốn XÓA nghệ sĩ "${username}"? Toàn bộ file cấu hình của họ sẽ bị xóa.`, 'Xác nhận xóa', 'danger'))) return;

    try {
      const res = await fetch('/api/acp/artists/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (res.ok) {
        const data = await res.json();
        const sum = data.summary;
        let msg = `Đã xóa thành công tài khoản ${sum.artistName} (@${sum.username}).\n\nChi tiết dọn dẹp:\n`;
        msg += `- Xóa ${sum.songsDeleted} bài hát, ${sum.playlistsDeleted} playlist.\n`;
        msg += `- Xóa ${sum.imagesDeleted} hình ảnh, ${sum.audiosDeleted} âm thanh.\n`;
        msg += `- Xóa ${sum.localFilesDeleted} file trên server (Giải phóng ${formatSize(sum.localSizeFreed)}).\n`;
        msg += `- Xóa ${sum.r2FilesDeleted} file trên Cloudflare R2.`;
        if (sum.errors && sum.errors.length > 0) {
          msg += `\n\nCảnh báo (${sum.errors.length} lỗi): ${sum.errors.join(', ')}`;
        }
        await showConfirm(msg, 'Thành công', 'info');
        fetchArtists();
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Lỗi khi xóa nghệ sĩ', 'Lỗi', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleSaveLandingConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingLanding(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tagline: landingTagline,
          heroTitle: landingHeroTitle,
          heroSubtitle: landingHeroSubtitle,
          heroDescription: landingHeroDesc,
          footerText: landingFooterText,
          systemIp,
          adminUsername,
          adminPassword,
          pageTitle: landingPageTitle,
          ogImageUrl: landingOgImageUrl,
          faviconUrl: landingFaviconUrl,
          statusBadge,
          featuresTitle,
          featuresSub,
          feature1Title,
          feature1Desc,
          feature2Title,
          feature2Desc,
          feature3Title,
          feature3Desc,
          feature4Title,
          feature4Desc,
          menuVaultVi,
          menuAboutVi,
          menuBioVi,
          globalLayoutSections,
          showArtistsSection,
          cloudSyncEnabled,
          defaultAdminTheme,
          demoSongInfo: { title: demoSongTitle, artist: demoSongArtist, lyrics: demoSongLyrics },
          templateNames,
          templateVip,
          adminThemesVip
        })
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã lưu cấu hình trang chủ thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 3000);
        fetchLandingConfig();
      } else {
        alert('Lỗi khi lưu cấu hình trang chủ');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsSavingLanding(false);
    }
  };

  const handleTranslateLanding = async () => {
    setIsTranslatingLanding(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config/translate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã dịch tự động toàn bộ trang chủ & các thành phần chung thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 5000);
        fetchLandingConfig();
      } else {
        const data = await res.json();
        alert('Lỗi biên dịch: ' + (data.error || 'Vui lòng thử lại sau.'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsTranslatingLanding(false);
    }
  };

  const handleTranslateTemplates = async () => {
    setIsTranslatingTemplates(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config/translate-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã tự động dịch thuật và cập nhật tên giao diện mới cho các ngôn ngữ khác thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 5000);
        fetchLandingConfig();
      } else {
        const data = await res.json();
        alert('Lỗi biên dịch: ' + (data.error || 'Vui lòng thử lại sau.'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsTranslatingTemplates(false);
    }
  };

  // --- FAQ & Terms Handlers ---
  const handleSaveFaq = async (updatedFaqs: any[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ faq: updatedFaqs })
      });
      if (res.ok) {
        setFaqs(updatedFaqs);
        setToast('Đã lưu FAQ thành công!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu FAQ');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddOrEditFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ.trim() || !faqA.trim()) return;
    let newFaqs = [...faqs];
    if (editingFaqIdx !== null) {
      newFaqs[editingFaqIdx] = { q: faqQ, a: faqA };
      setEditingFaqIdx(null);
    } else {
      newFaqs.push({ q: faqQ, a: faqA });
    }
    setFaqQ('');
    setFaqA('');
    handleSaveFaq(newFaqs);
  };

  const handleDeleteFaq = (idx: number) => {
    const newFaqs = faqs.filter((_, i) => i !== idx);
    handleSaveFaq(newFaqs);
  };

  // --- Forbidden Keywords Handlers ---
  const handleSaveKeywords = async (updatedKeywords: string[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ forbiddenKeywords: updatedKeywords })
      });
      if (res.ok) {
        setKeywords(updatedKeywords);
        setToast('Đã cập nhật danh sách từ khóa bị cấm!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu từ khóa');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const word = newKeyword.trim().toLowerCase();
    if (keywords.includes(word)) {
      setToast('Từ khóa đã tồn tại!');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const updated = [...keywords, word];
    setNewKeyword('');
    handleSaveKeywords(updated);
  };

  const handleDeleteKeyword = (word: string) => {
    const updated = keywords.filter(w => w !== word);
    handleSaveKeywords(updated);
  };

  // --- Content Moderation Handlers (Flagged Songs) ---
  const fetchFlaggedSongs = async () => {
    setLoadingFlagged(true);
    try {
      const res = await fetch('/api/acp/flagged-songs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedSongs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFlagged(false);
    }
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    setSubmittingSongEdit(true);
    try {
      const res = await fetch('/api/acp/songs/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editingSong.username,
          songId: editingSong.songId,
          title: editSongTitle,
          lyrics: editSongLyrics
        })
      });
      if (res.ok) {
        setToast('Đã cập nhật bài hát thành công!');
        setEditingSong(null);
        fetchFlaggedSongs();
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi cập nhật bài hát');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmittingSongEdit(false);
    }
  };

  const handleDeleteSong = async (song: any) => {
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn gỡ bỏ bài hát "${song.title}" của nghệ sĩ ${song.artistName}? Hệ thống sẽ tự động gửi thư cảnh báo cho thành viên này.`,
      'Gỡ bỏ bài hát'
    );
    if (!ok) return;

    try {
      const res = await fetch('/api/acp/songs/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: song.username,
          songId: song.songId,
          songTitle: song.title,
          flaggedKeywords: song.matchingKeywords
        })
      });
      if (res.ok) {
        setToast('Đã gỡ bài hát và gửi thông báo thành công!');
        fetchFlaggedSongs();
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi gỡ bài hát');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // --- Roles & Permissions Handlers ---
  const handleSaveRoles = async (updatedRoles: any[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roles: updatedRoles })
      });
      if (res.ok) {
        setRoles(updatedRoles);
        setToast('Đã lưu cấu hình phân quyền!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu phân quyền');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSaveRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    const newRole = {
      name: roleName.trim(),
      maxPosts: Number(roleMaxPosts),
      accessControl: roleAccessControl,
      demoPassword: roleDemoPassword,
      secretLink: roleSecretLink,
      customDomain: roleCustomDomain,
      bio: roleBio,
      aboutMe: roleAboutMe,
      uiEdit: roleUiEdit,
      exclusiveUi: roleExclusiveUi,
      database: roleDatabase,
      subscriptionPricing: roleSubscriptionPricing,
      price: rolePrice.trim(),
      defaultTheme: roleDefaultTheme
    };

    let updatedRoles = [...roles];
    if (editingRoleIdx !== null) {
      updatedRoles[editingRoleIdx] = newRole;
      setEditingRoleIdx(null);
    } else {
      updatedRoles.push(newRole);
    }
    setShowRoleModal(false);
    handleSaveRoles(updatedRoles);
  };

  useEffect(() => {
    if (token && activeTab === 'content') {
      fetchFlaggedSongs();
    }
  }, [token, activeTab]);

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistName(artist.artistName);
    setArtistUsername(artist.username);
    setArtistExtension(artist.extension);
    setArtistPassword('');
    setArtistVerified(artist.verified);
    setArtistIsPublic(artist.isPublic !== false);
    setArtistDbConfig(artist.dbConfig || '');
    setArtistHasExternalWebsite(!!artist.hasExternalWebsite);
    setArtistExternalWebsiteUrl(artist.externalWebsiteUrl || '');
    setArtistDefaultLanguage(artist.defaultLanguage || 'vi');
    setArtistBio(artist.artistBio || '');
    setArtistIsSpecial(!!artist.isSpecial);
    setArtistRoleId((artist as any).roleId || '');
    setArtistMaxSongs((artist as any).maxSongs || '');
    setArtistExtraUsernames(artist.extraUsernames || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setArtistName('');
    setArtistUsername('');
    setArtistExtension('');
    setArtistPassword('');
    setArtistVerified(true);
    setArtistIsPublic(true);
    setArtistDbConfig('');
    setArtistHasExternalWebsite(false);
    setArtistExternalWebsiteUrl('');
    setArtistDefaultLanguage('vi');
    setArtistBio('');
    setArtistIsSpecial(false);
    setArtistRoleId('');
    setArtistMaxSongs('');
    setArtistExtraUsernames('');
    setFormErr('');
  };

  const filteredArtists = artists.filter(a => 
    a.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.extension.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none"></div>

        <div className="relative bg-neutral-900/50 border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showLoginPass ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 pr-11 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors"
                  title={showLoginPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginErr && (
              <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-xl px-3 border border-rose-500/15">
                {loginErr}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Login to System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            ADMIN PANEL
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'artists'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Nghệ Sĩ & Thành Viên</span>
          </button>
          <button
            onClick={() => setActiveTab('edit_item')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'edit_item'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 className="w-4.5 h-4.5" />
            <span>Sửa Bài / Playlist</span>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-4.5 h-4.5" />
            <span>Trang Chủ & SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Hỗ trợ (Tickets)</span>
            </div>
            {tickets.filter(t => t.status !== 'resolved').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== 'resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('admin_theme')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'admin_theme'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutTemplate className="w-4.5 h-4.5" />
            <span>Giao Diện</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4.5 h-4.5" />
            <span>Chủ Đề</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>FAQ (Hỏi Đáp)</span>
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'keywords'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-4.5 h-4.5" />
            <span>Từ Khoá Cấm</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 className="w-4.5 h-4.5" />
            <span>Quản Lý Duyệt Bài</span>
          </button>

          <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4.5 h-4.5" />
              <span>Phân Quyền (Roles)</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4.5 h-4.5" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-4.5 h-4.5" />
              <span>Bảng Giá & Gói Cước</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              <span>Khám Phá</span>
            </button>
            <button
              onClick={() => setActiveTab('cleanup')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'cleanup'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trash2 className="w-4.5 h-4.5" />
              <span>Dọn dẹp Dữ liệu</span>
            </button>
        </div>
      </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 min-w-0">
            {activeTab === 'artists' ? (
          <>
            {/* Banner stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-purple-500/10"><Users className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Tổng Số Nghệ Sĩ</p>
                <h3 className="text-3xl font-black">{artists.length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-sky-500/10"><CheckCircle className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Xác Thực (Tích Xanh)</p>
                <h3 className="text-3xl font-black text-sky-400">{artists.filter(a => a.verified).length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-emerald-500/10"><Globe className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Công Khai (Trang chủ)</p>
                <h3 className="text-3xl font-black text-emerald-400">{artists.filter(a => a.isPublic !== false).length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-pink-500/10"><RefreshCw className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Thay Đổi Tên</p>
                <h3 className="text-3xl font-black text-pink-400">{artists.filter(a => !!a.pendingNameChange).length}</h3>
              </div>
            </div>

            {/* Filters and Add button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm nghệ sĩ theo tên, username, extension..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/60 border border-white/5 py-3 pl-11 pr-4 rounded-2xl text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-neutral-500 transition-all"
                />
              </div>

              <button 
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold py-3 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Thêm Nghệ Sĩ Mới
              </button>
            </div>

            {/* Artist Table / Grid */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
              {filteredArtists.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Không tìm thấy nghệ sĩ nào phù hợp.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-neutral-900/50">
                        <th className="p-4 pl-6 text-xs text-neutral-400 uppercase font-bold tracking-wider">Nghệ Sĩ</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Role</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Trạng Thái Duyệt</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Bài/Demo</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Email</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider text-right pr-6">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredArtists.slice(artistCurrentPage * artistPageSize, (artistCurrentPage + 1) * artistPageSize).map((artist, idx) => (
                        <tr key={`${artist.username || ''}-${artist.id || ''}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2.5">
                              <div>
                                <div className="font-bold flex items-center gap-1.5">
                                  {artist.artistName}
                                  {artist.verified && (
                                    <span className="bg-sky-500/15 text-sky-400 p-0.5 rounded-full inline-block border border-sky-500/20" title="Đã xác thực">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                  )}
                                  {artist.isSpecial && (
                                    <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-xs border border-amber-300/40">
                                      V.VIP
                                    </span>
                                  )}
                                </div>
                                
                                {/* Pending name change badge */}
                                {artist.pendingNameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi thành: "{artist.pendingNameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveNameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectNameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                                {artist.pendingUsernameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi Username thành: "{artist.pendingUsernameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveUsernameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectUsernameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                                {artist.pendingExtensionChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi Sub-domain thành: "{artist.pendingExtensionChange}"</span>
                                    <button 
                                      onClick={() => handleApproveExtensionChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectExtensionChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  if (!artist.roleId || artist.roleId === 'free') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'free' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer ${(!artist.roleId || artist.roleId === 'free') ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                FREE
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'pro') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'pro' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer ${artist.roleId === 'pro' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                PRO
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'vip') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'vip' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1 ${artist.roleId === 'vip' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                {artist.roleId === 'vip' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>}
                                VIP
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <a 
                                href={getArtistSubdomainUrl(artist.extension, artist)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                /{artist.extension}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              {artist.extraUsernames && (
                                <span className="text-[10px] text-neutral-500 font-mono" title="Username bổ sung">
                                  Alias: {artist.extraUsernames}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              {/* 2-Tier Status Badge */}
                              {artist.activated === false ? (
                                artist.emailVerified === true ? (
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit shadow-xs" title="Tài khoản đang bị khóa nhưng đã xác thực OTP email thành công - Sẵn sàng duyệt">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                    🔒 Khóa • ✉️ Đã Xác Thực
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-fit shadow-xs" title="Tài khoản đang bị khóa và chưa nhập OTP xác thực email">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    🔒 Khóa • ⚠️ Chưa Xác Thực
                                  </span>
                                )
                              ) : (
                                artist.verified === true ? (
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1.5 w-fit shadow-xs" title="Tài khoản đang hoạt động và ĐÃ ĐƯỢC XÁC MINH chính chủ (Có Tích Xanh)">
                                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                                    🟢 Hoạt Động • 🔷 Đã Xác Minh ✓
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-fit shadow-xs" title="Tài khoản đang hoạt động nhưng CHƯA XÁC MINH chính chủ (Chưa có Tích Xanh)">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    🟢 Hoạt Động • 👤 Chưa Xác Minh
                                  </span>
                                )
                              )}

                              {/* Status Action Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={async () => {
                                    try {
                                      const nextActivatedStatus = artist.activated === false ? true : false;
                                      const res = await fetch('/api/acp/artists/update', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                          originalUsername: artist.username,
                                          activated: nextActivatedStatus
                                        })
                                      });
                                      if (res.ok) {
                                        fetchArtists();
                                      } else {
                                        alert("Lỗi khi thay đổi trạng thái kích hoạt!");
                                      }
                                    } catch (e) {
                                      alert("Lỗi kết nối mạng!");
                                    }
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                                    artist.activated !== false
                                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-white/5'
                                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-sm'
                                  }`}
                                >
                                  {artist.activated !== false ? 'Khóa' : 'Kích Hoạt'}
                                </button>

                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch('/api/acp/artists/update', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                          originalUsername: artist.username,
                                          verified: !artist.verified
                                        })
                                      });
                                      if (res.ok) {
                                        fetchArtists();
                                      } else {
                                        alert("Lỗi khi thay đổi trạng thái Tích Xanh!");
                                      }
                                    } catch (e) {
                                      alert("Lỗi kết nối mạng!");
                                    }
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                                    artist.verified === true
                                      ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40'
                                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border-white/5'
                                  }`}
                                  title="Bật/Tắt Tích Xanh chính chủ cho nghệ sĩ"
                                >
                                  {artist.verified === true ? 'Bỏ Tích Xanh' : '+ Tích Xanh'}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg text-xs font-bold font-mono">
                              {(artist as any).releasedCount || 0} / {(artist as any).demoCount || 0}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-400">
                            {artist.email ? (
                              <a href={`mailto:${artist.email}`} className="hover:text-white transition-colors">{artist.email}</a>
                            ) : (
                              <span className="text-neutral-600 italic">Trống</span>
                            )}
                          </td>
                          
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(artist)}
                                className="p-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteArtist(artist.username)}
                                disabled={artist.username === 'acxuantai'}
                                className={`p-2 rounded-xl transition-colors ${
                                  artist.username === 'acxuantai' 
                                    ? 'opacity-20 cursor-not-allowed text-neutral-600' 
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer'
                                }`}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-white/5 text-xs text-neutral-400 bg-neutral-950/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select
                      value={artistPageSize}
                      onChange={(e) => {
                        setArtistPageSize(Number(e.target.value));
                        setArtistCurrentPage(0);
                      }}
                      className="bg-neutral-800 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>nghệ sĩ mỗi trang</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={artistCurrentPage === 0}
                      onClick={() => setArtistCurrentPage(prev => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-neutral-850 border border-white/5 hover:bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Trước
                    </button>
                    
                    <span className="font-mono text-neutral-400">
                      Trang <span className="text-white font-bold">{artistCurrentPage + 1}</span> / {Math.max(1, Math.ceil(filteredArtists.length / artistPageSize))}
                    </span>

                    <button
                      disabled={artistCurrentPage >= Math.ceil(filteredArtists.length / artistPageSize) - 1}
                      onClick={() => setArtistCurrentPage(prev => prev + 1)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-850 border border-white/5 hover:bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : activeTab === 'landing' ? (
          /* Homepage config panel tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Layout className="w-5.5 h-5.5 text-purple-400" />
                  <span>Cấu hình giao diện & mô tả {getPlatformBrandName()}</span>
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Điều chỉnh tiêu đề, slogan, phần mô tả chính và chữ chân trang xuất hiện trên trang chủ.
                </p>
              </div>

              {/* Layout settings */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-4 sm:p-6 mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-black flex items-center gap-2 text-teal-400">
                    <LayoutTemplate className="w-5 h-5" />
                    <span>Bố cục nghệ sĩ mặc định</span>
                  </h2>
                  <p className="text-neutral-400 text-xs mt-1">
                    Kéo thả các phần dưới đây để sắp xếp thứ tự hiển thị mặc định của trang chủ nghệ sĩ. (Áp dụng cho nghệ sĩ chưa tự tùy chỉnh).
                  </p>
                </div>
                
                <div className="space-y-2">
                  {globalLayoutSections.map((sec, i) => (
                    <div 
                      key={`${sec}-${i}`} 
                      draggable 
                      onDragStart={(e) => handleDragStartLayout(e, i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropLayout(e, i)}
                      className="flex items-center gap-4 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm select-none"
                    >
                      <GripVertical className="text-neutral-500 w-4 h-4 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-neutral-200 text-xs">
                          {getLayoutSectionName(sec)}
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveLandingConfig} className="space-y-6">
                {/* Global Toggle: Hiển thị mục danh sách Kho Nhạc Nghệ Sĩ trên trang chủ */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" />
                      Hiển thị Mục Kho Nhạc Cá Nhân Các Nghệ Sĩ Trên Trang Chủ
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Bật: Trang chủ sẽ hiện mục Kho Nhạc Cá Nhân Các Nghệ Sĩ.<br />
                      <span className="text-amber-400 font-semibold">Tắt: Nút này sẽ ẨN HOÀN TOÀN mục này (bao gồm cả tiêu đề & danh sách) khỏi Trang Chủ.</span>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showArtistsSection}
                    onChange={(e) => setShowArtistsSection(e.target.checked)}
                    className="w-6 h-6 accent-purple-500 rounded cursor-pointer shrink-0 ml-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Huy hiệu trạng thái góc phải (Status Badge)
                    </label>
                    <input 
                      type="text" 
                      value={statusBadge}
                      onChange={(e) => setStatusBadge(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Đang hoạt động thử nghiệm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Dòng giới thiệu nhỏ nổi bật (Tagline)
                    </label>
                    <input 
                      type="text" 
                      value={landingTagline}
                      onChange={(e) => setLandingTagline(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Kho lưu trữ và chia sẻ âm nhạc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tiêu đề chính (Hero Title)
                    </label>
                    <input 
                      type="text" 
                      required
                      value={landingHeroTitle}
                      onChange={(e) => setLandingHeroTitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-bold"
                      placeholder="Chorus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Dòng phụ đề (Hero Subtitle)
                    </label>
                    <input 
                      type="text" 
                      required
                      value={landingHeroSubtitle}
                      onChange={(e) => setLandingHeroSubtitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Nơi những ca khúc khởi đầu."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Mô tả chi tiết trang chủ (Hero Description)
                  </label>
                  <textarea 
                    required
                    value={landingHeroDesc}
                    onChange={(e) => setLandingHeroDesc(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm h-32 leading-relaxed"
                    placeholder="Giải pháp hoàn hảo giúp các Nghệ sĩ tự do lưu trữ demo..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Chữ chân trang (Footer Text)
                  </label>
                  <input 
                    type="text" 
                    required
                    value={landingFooterText}
                    onChange={(e) => setLandingFooterText(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="CHORUS.VN © 2026 - Nơi những ca khúc bắt đầu."
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Địa chỉ IP hệ thống (System IP)
                  </label>
                  <input 
                    type="text" 
                    value={systemIp}
                    onChange={(e) => setSystemIp(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="VD: 103.111.222.33"
                  />
                  <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed">
                    Dùng làm IP hướng dẫn để các nghệ sĩ trỏ bản ghi A (Custom Domain DNS) về hệ thống.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-widest mb-4">
                    Tài khoản Quản trị (ACP Login)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tên đăng nhập
                      </label>
                      <input 
                        type="text" 
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input 
                          type={showAdminPass ? "text" : "password"} 
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 pr-11 rounded-xl focus:border-rose-500 focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAdminPass(!showAdminPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors"
                          title={showAdminPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-rose-300/70 text-[11px] mt-1.5 leading-relaxed bg-rose-500/10 p-2 rounded-lg">
                    Tài khoản và mật khẩu này dùng để đăng nhập vào trang quản trị ACP (đường dẫn /acp). Hãy đổi mật khẩu thường xuyên để bảo vệ hệ thống.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Cấu hình chia sẻ & Metadata (SEO)
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tiêu đề chia sẻ (Sharing Title)
                    </label>
                    <input 
                      type="text" 
                      value={landingPageTitle}
                      onChange={(e) => setLandingPageTitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="VD: Chorus.vn - Nơi những ca khúc bắt đầu"
                    />
                    <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed">
                      Tiêu đề hiển thị trên tab trình duyệt và tiêu đề khi chia sẻ liên kết lên mạng xã hội.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        Favicon (Icon tab trình duyệt)
                      </label>
                      <div className="flex items-center gap-4">
                        {landingFaviconUrl && (
                          <img src={landingFaviconUrl} className="w-12 h-12 bg-black/20 rounded-xl object-contain border border-white/10 shadow-sm" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('landingFaviconUpload')?.click()}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all border shadow-sm ${
                            faviconProgress === 100 
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer'
                          }`}
                        >
                          {faviconProgress > 0 && faviconProgress < 100 ? (
                            <span className="text-[10px] font-bold">{faviconProgress}%</span>
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </button>
                        {landingFaviconUrl && (
                          <button 
                            type="button" 
                            onClick={() => { setLandingFaviconUrl(''); setFaviconProgress(0); }} 
                            className="w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input 
                          type="file" 
                          id="landingFaviconUpload" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            try {
                              const url = await uploadWithProgress(e.target.files[0], setFaviconProgress);
                              setLandingFaviconUrl(url);
                            } catch (err) {
                              alert('Lỗi upload icon!');
                              setFaviconProgress(0);
                            }
                          }} 
                        />
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1.5">
                        Ảnh icon vuông định dạng .png hoặc .ico hiển thị trên tab trình duyệt.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        Custom Thumbnail (Ảnh đại diện chia sẻ)
                      </label>
                      <div className="flex items-center gap-4">
                        {landingOgImageUrl && (
                          <img src={landingOgImageUrl} className="w-20 h-12 bg-black/20 rounded-xl object-cover border border-white/10 shadow-sm" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('landingOgUpload')?.click()}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all border shadow-sm ${
                            ogImageProgress === 100 
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer'
                          }`}
                        >
                          {ogImageProgress > 0 && ogImageProgress < 100 ? (
                            <span className="text-[10px] font-bold">{ogImageProgress}%</span>
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </button>
                        {landingOgImageUrl && (
                          <button 
                            type="button" 
                            onClick={() => { setLandingOgImageUrl(''); setOgImageProgress(0); }} 
                            className="w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input 
                          type="file" 
                          id="landingOgUpload" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            try {
                              const url = await uploadWithProgress(e.target.files[0], setOgImageProgress);
                              setLandingOgImageUrl(url);
                            } catch (err) {
                              alert('Lỗi upload thumbnail!');
                              setOgImageProgress(0);
                            }
                          }} 
                        />
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1.5">
                        Ảnh dùng làm banner khi chia sẻ link lên Facebook, Zalo, Twitter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Cài đặt Đồng bộ Cloud
                  </h3>
                  <div className="flex items-start gap-4 bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox"
                        id="cloudSyncToggle"
                        checked={cloudSyncEnabled}
                        onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 text-purple-600 focus:ring-purple-500 bg-black/40 cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="cloudSyncToggle" className="text-sm font-bold text-white cursor-pointer select-none">
                        Đồng bộ dữ liệu lên Cloud Firestore
                      </label>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Khi bật, tất cả dữ liệu hoạt động của nghệ sĩ sẽ được sao lưu, đồng bộ thời gian thực lên Cloud Firestore của Google Firebase. Khi tắt, hệ thống sẽ hoạt động độc lập và chỉ lưu dữ liệu offline trong các tệp JSON cục bộ.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Giao diện Bảng điều khiển Hệ thống
                  </h3>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <label className="block text-sm font-bold text-white mb-2">
                      Giao diện Bảng điều khiển Mặc định cho Nghệ sĩ mới
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setDefaultAdminTheme('liquid-glass')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          defaultAdminTheme === 'liquid-glass' 
                            ? 'bg-purple-600/10 border-purple-500 text-white' 
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:border-white/15'
                        }`}
                      >
                        <div className="font-extrabold text-xs">Liquid Glass</div>
                        <div className="text-[10px] mt-1 opacity-80">Giao diện kính mờ mặc định ban đầu</div>
                      </div>

                      <div 
                        onClick={() => setDefaultAdminTheme('gold')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          defaultAdminTheme === 'gold' 
                            ? 'bg-yellow-500/10 border-yellow-500 text-white' 
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:border-white/15'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center gap-1">
                          Gold <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        </div>
                        <div className="text-[10px] mt-1 opacity-80">Giao diện hoàng gia luxury mới</div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                      Lựa chọn giao diện mặc định sẽ được áp dụng cho bảng điều khiển của tất cả nghệ sĩ khi mới khởi tạo tài khoản hoặc chưa chủ động chọn giao diện riêng biệt.
                    </p>
                  </div>
                </div>

                {/* Edit fields for the 4 features */}
                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest">
                      Cấu hình các tính năng nổi bật ở Trang chủ
                    </h3>
                    <p className="text-neutral-400 text-xs">
                      Tùy chỉnh tiêu đề chính và phụ đề cho phần tính năng nổi bật trên trang chủ (Ảnh 2).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tiêu đề khu vực tính năng
                      </label>
                      <input 
                        type="text" 
                        required
                        value={featuresTitle}
                        onChange={(e) => setFeaturesTitle(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Được thiết kế cho trải nghiệm đỉnh cao"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Dòng phụ đề tính năng
                      </label>
                      <input 
                        type="text" 
                        required
                        value={featuresSub}
                        onChange={(e) => setFeaturesSub(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Tích hợp những công nghệ hiện đại nhất..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Feature 1 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 1</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature1Title}
                          onChange={(e) => setFeature1Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Bảo mật demo & tuyển tập"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature1Desc}
                          onChange={(e) => setFeature1Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Thiết lập mật mã cho từng tác phẩm..."
                        />
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 2</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature2Title}
                          onChange={(e) => setFeature2Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Dịch thuật thông minh"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature2Desc}
                          onChange={(e) => setFeature2Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Nhận diện vị trí địa lý..."
                        />
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 3</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature3Title}
                          onChange={(e) => setFeature3Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Đồng bộ Cloud & Cache cục bộ"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature3Desc}
                          onChange={(e) => setFeature3Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Lưu trữ dữ liệu kép trên Cloud..."
                        />
                      </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 4</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature4Title}
                          onChange={(e) => setFeature4Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Bố cục mang đậm dấu ấn cá nhân"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature4Desc}
                          onChange={(e) => setFeature4Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Tùy chỉnh ảnh bìa đại diện..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 1 (Kho Nhạc)
                      </label>
                      <input 
                        type="text" 
                        value={menuVaultVi}
                        onChange={(e) => setMenuVaultVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Kho Nhạc"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 2 (Về Tôi)
                      </label>
                      <input 
                        type="text" 
                        value={menuAboutVi}
                        onChange={(e) => setMenuAboutVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Về Tôi"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 3 (Tiểu Sử)
                      </label>
                      <input 
                        type="text" 
                        value={menuBioVi}
                        onChange={(e) => setMenuBioVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Tiểu Sử"
                      />
                    </div>
                  </div>
                </div>

                {landingSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{landingSuccessMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    disabled={isTranslatingLanding || isSavingLanding}
                    onClick={handleTranslateLanding}
                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-extrabold py-3.5 px-6 rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{isTranslatingLanding ? 'Đang dịch thuật...' : 'Biên dịch trang chủ & phần chung (AI)'}</span>
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingLanding || isTranslatingLanding}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white font-extrabold py-3.5 px-8 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingLanding ? 'Đang lưu cấu hình...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Subscribers Column */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col h-fit max-h-[600px]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <Database className="text-purple-400 w-4.5 h-4.5" />
                    <span>Email đăng ký ({subscribers.length})</span>
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Danh sách nhận thông báo bản phát hành</p>
                </div>
                {subscribers.length > 0 && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(subscribers.join(', '));
                      alert('Đã sao chép tất cả email vào bộ nhớ tạm!');
                    }}
                    className="text-[10px] bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-bold px-2 py-1 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                  >
                    Sao chép tất cả
                  </button>
                )}
              </div>

              {subscribers.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 my-auto">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-10" />
                  <p className="text-xs">Chưa có ai đăng ký.</p>
                </div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2 pr-1">
                  {subscribers.map((email, idx) => (
                    <div 
                      key={`l2551-idx-${idx}`} 
                      className="bg-black/30 border border-white/5 px-3 py-2.5 rounded-xl flex items-center justify-between group hover:border-purple-500/20 transition-all"
                    >
                      <span className="text-xs font-mono text-neutral-300 select-all truncate">{email}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          alert(`Đã sao chép email: ${email}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded-md transition-opacity cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          /* Tickets (Inbox) Tab */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2 text-white">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                  <span>Hộp Thư Yêu Cầu Gỡ Bài</span>
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Xem xét, trao đổi và ra quyết định xử lý các tranh chấp bản quyền hoặc yêu cầu gỡ sản phẩm âm nhạc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposeModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md tracking-wider uppercase transition-all duration-200 shrink-0 self-start sm:self-center active:scale-95 border border-purple-500/20"
              >
                <Mail className="w-4 h-4 text-purple-200" />
                <span>Soạn Thư Hệ Thống</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px]">
              {/* Tickets List Column */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col h-full overflow-hidden">
                <h3 className="text-sm font-black text-neutral-200 mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
                  <span>Danh sách yêu cầu ({tickets.length})</span>
                  <button 
                    onClick={fetchTickets}
                    className="p-1 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </h3>

                {tickets.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 my-auto flex flex-col items-center justify-center">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-10" />
                    <p className="text-xs">Chưa có yêu cầu nào.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2 pr-1">
                    {tickets.map((ticket: any, idx: number) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const lastMsg = ticket.messages[ticket.messages.length - 1];
                      
                      return (
                        <button
                          key={`${ticket.id || ''}-${idx}`}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/10 border-purple-500/30 text-white'
                              : 'bg-black/30 border-white/5 hover:border-white/10 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            {ticket.type === 'remove' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15">
                                Yêu cầu gỡ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/15">
                                Yêu cầu sửa
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              ticket.status === 'open' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                : ticket.status === 'removed'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {ticket.status === 'open' ? 'Đang xử lý' : ticket.status === 'removed' ? 'Đã gỡ bài' : 'Đã đóng'}
                            </span>
                          </div>

                          <div className="font-bold text-sm text-neutral-100 truncate w-full flex items-center gap-1.5">
                            <Disc3 className={`w-3.5 h-3.5 shrink-0 ${ticket.status === 'open' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                            <span className="truncate">{ticket.songTitle}</span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex flex-col gap-0.5 w-full">
                            <div className="truncate">Người yêu cầu: <strong className="text-neutral-200">@{ticket.reporter.username}</strong></div>
                          </div>

                          {lastMsg && (
                            <div className="text-[10px] text-neutral-500 border-t border-white/5 pt-1.5 mt-0.5 truncate w-full italic">
                              {lastMsg.senderName}: {lastMsg.text}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chat / Moderation Panel */}
              <div className={`lg:col-span-2 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex-col h-full overflow-hidden min-h-0 ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {selectedTicket ? (
                  <div className="flex flex-col h-full overflow-hidden min-h-0">
                    {/* Header */}
                    <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{selectedTicket.songTitle}</h3>
                          {selectedTicket.type === 'remove' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/15">
                              Yêu cầu gỡ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                              Yêu cầu sửa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          <span className="hidden sm:inline">Người yêu cầu: </span><strong className="text-neutral-200">{selectedTicket.reporter.name}</strong><span className="hidden sm:inline"> (@{selectedTicket.reporter.username})</span> | Kênh uploader: <strong className="text-neutral-200">{selectedTicket.sourceArtist}</strong>
                        </p>
                      </div>

                      {selectedTicket.status === 'open' && (
                        <div className="flex items-center gap-2">
                          {selectedTicket.type === 'remove' && (
                            <button
                              onClick={() => handleAdminRemoveSong(selectedTicket.id)}
                              disabled={isHandlingTicketAction}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/10 transition-all active:scale-95"
                              title="Gỡ Bài Hát"
                            >
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline font-bold whitespace-nowrap">Đồng Ý</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleResolveTicket(selectedTicket.id)}
                            disabled={isHandlingTicketAction}
                            className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 hover:text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all active:scale-95"
                            title="Từ Chối"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Từ Chối</span>
                          </button>
                        </div>
                      )}
                      {selectedTicket.status !== 'open' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReopenTicket(selectedTicket.id)}
                            disabled={isHandlingTicketAction}
                            className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 hover:text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all active:scale-95"
                            title="Mở Lại"
                          >
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Mở Lại</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar my-4 space-y-4 pr-1">
                      {/* Reason Box */}
                      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-xs leading-relaxed">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {selectedTicket.type === 'remove' ? 'Lý do yêu cầu gỡ' : 'Lý do yêu cầu sửa'}
                        </div>
                        <p className="whitespace-pre-wrap italic text-neutral-300">"{selectedTicket.description}"</p>
                        <p className="text-neutral-500 text-[10px] text-right mt-1.5">{new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</p>
                      </div>

                      {/* Messages loop */}
                      {selectedTicket.messages.map((msg: any, idx: number) => {
                        let senderUsername = msg.sender;
                        if (msg.sender === 'admin' && msg.senderName !== 'Hệ thống' && msg.senderName !== 'Admin hệ thống' && msg.senderName !== 'Admin') {
                          const found = artists.find(a => a.artistName === msg.senderName);
                          if (found) senderUsername = found.username;
                        }
                        if (msg.sender === 'reporter' || msg.role === 'reporter') senderUsername = selectedTicket.reporter.username;
                        if (msg.sender === 'source' || msg.role === 'target') senderUsername = selectedTicket.sourceArtist;
                        
                        const isSystemAdmin = msg.senderName === 'Hệ thống' || msg.senderName === 'Admin hệ thống' || (msg.sender === 'admin' && msg.senderName === 'Admin');
                        // In ACP, the viewer is the System Admin
                        const isMe = isSystemAdmin;
                        const isReporter = !isSystemAdmin && (msg.sender === 'reporter' || msg.role === 'reporter' || senderUsername === selectedTicket.reporter.username || msg.senderName === selectedTicket.reporter.name);
                        
                        const initial = (msg.senderName || senderUsername || '?').charAt(0).toUpperCase();
                        
                        let avatarBg = 'bg-gradient-to-tr from-neutral-600 to-neutral-700';
                        if (isSystemAdmin) {
                          avatarBg = 'bg-gradient-to-tr from-rose-500 to-amber-500';
                        } else if (isReporter) {
                          avatarBg = 'bg-gradient-to-tr from-sky-500 to-blue-600';
                        } else {
                          avatarBg = 'bg-gradient-to-tr from-emerald-500 to-teal-600';
                        }
                        
                        const artistAvatar = isSystemAdmin ? landingFaviconUrl : artists.find(a => a.extension === senderUsername || a.username === senderUsername)?.homeCoverUrl;

                        return (
                          <div 
                            key={`msg-${msg.id || idx}-${idx}`} 
                            className={`flex gap-3 items-end w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-4`}
                          >
                            {/* Avatar */}
                            {!isSystemAdmin && (
                              <Link to={`/${senderUsername}`} target="_blank" className={`w-8 h-8 rounded-full ${artistAvatar ? 'bg-transparent' : avatarBg} text-white flex items-center justify-center text-xs font-extrabold shadow-md shrink-0 mb-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}>
                                {artistAvatar ? (
                                  <img src={artistAvatar} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  initial
                                )}
                              </Link>
                            )}
                            {isSystemAdmin && (
                              <div className="w-8 h-8 shrink-0 mb-1 flex items-center justify-center">
                                <ChorusLogo className="w-8 h-8" />
                              </div>
                            )}

                            {/* Message bubble & details */}
                            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                              {/* Sender Name & Role Badge */}
                              <div className="text-[10px] text-neutral-400 mb-1 px-1 flex items-center gap-1.5">
                                <span className="font-semibold">{msg.senderName}</span>
                                {isSystemAdmin ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    Admin
                                  </span>
                                ) : isReporter ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Reporter
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Uploader
                                  </span>
                                )}
                              </div>

                              {/* Bubble Box */}
                              <div 
                                title={msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md transition-all relative ${
                                isMe 
                                  ? 'bg-rose-600 text-white rounded-br-none font-medium shadow-rose-500/20' 
                                  : 'bg-neutral-800 border border-white/10 text-neutral-100 rounded-bl-none'
                              }`}>
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              </div>

                              {/* Timestamp */}
                              <span className="text-[9px] text-neutral-500 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    {selectedTicket.type === 'edit' ? (
                      <div className="text-center py-4 border-t border-white/5 bg-white/5 rounded-xl shrink-0 mt-2">
                        <p className="text-xs text-neutral-400 font-semibold italic">Admin không tham gia vào yêu cầu chỉnh sửa (chỉ 2 bên trao đổi).</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 shrink-0 border-t border-white/5 pt-4">
                        {selectedTicket.status !== 'open' && (
                          <p className="text-[11px] text-neutral-400 italic text-center mb-1 bg-white/5 py-1 rounded-lg">
                            Yêu cầu này đã đóng/giải quyết xong nhưng bạn vẫn có thể tiếp tục nhắn tin trao đổi.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendTicketMessage()}
                            placeholder="Nhập tin nhắn hệ thống gửi đến các bên..."
                            disabled={isHandlingTicketAction}
                            className="flex-1 bg-black/40 text-xs text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            onClick={handleSendTicketMessage}
                            disabled={isHandlingTicketAction || !chatText.trim()}
                            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-white transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-lg active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500">
                    <MessageSquare className="w-16 h-16 mb-2 opacity-5" />
                    <p className="text-xs">Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi và xử lý.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'admin_theme' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-yellow-500" />
                    Quản lý Giao Diện
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">Cấu hình các giao diện hiển thị cho bảng điều khiển của nghệ sĩ.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveLandingConfig()}
                    disabled={isSavingLanding || isTranslatingTemplates}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingLanding ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
              {landingSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{landingSuccessMsg}</p>
                </div>
              )}

              {/* Cài đặt Giao diện Admin */}
              <div className="p-6 bg-neutral-900/40 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2 text-yellow-500">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Quản lý Giao diện Bảng Điều Khiển (Admin Panel Themes)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cấu hình quyền truy cập VIP cho các giao diện của trang quản trị nghệ sĩ. Giao diện mặc định là <strong>Liquid Glass</strong> và giao diện mới là <strong>Gold</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'liquid-glass', name: 'Giao diện: Liquid Glass', desc: 'Giao diện kính mờ mặc định (Thẻ đứng)', defaultPro: false, defaultVip: false },
                    { id: 'gold', name: 'Giao diện: Gold Luxury', desc: 'Giao diện hoàng gia luxury (Thẻ đứng)', defaultPro: true, defaultVip: true },
                    { id: 'musician', name: 'Giao diện: Dreamy Theme', desc: 'Giao diện mộng mơ nghệ sĩ (Thẻ ngang)', defaultPro: true, defaultVip: false },
                    { id: 'musician2', name: 'Giao diện: Musician Theme (Vinyl 3D)', desc: 'Giao diện nhạc sĩ đĩa than 3D xoay nổi bật trên kệ gỗ', defaultPro: true, defaultVip: false },
                  ].map((item) => {
                    const currentVal = adminThemesVip[item.id];
                    let isPro = item.defaultPro;
                    let isVip = item.defaultVip;

                    if (typeof currentVal === 'object' && currentVal !== null) {
                      isVip = !!currentVal.isVip;
                      isPro = isVip || !!currentVal.isPro;
                    } else if (currentVal === true) {
                      isPro = true;
                      isVip = true;
                    } else if (currentVal === false) {
                      isPro = false;
                      isVip = false;
                    }

                    const handleProChange = (checked: boolean) => {
                      const nextPro = checked;
                      const nextVip = nextPro ? isVip : false;
                      setAdminThemesVip({
                        ...adminThemesVip,
                        [item.id]: { isPro: nextPro, isVip: nextVip }
                      });
                    };

                    const handleVipChange = (checked: boolean) => {
                      const nextVip = checked;
                      const nextPro = nextVip ? true : isPro;
                      setAdminThemesVip({
                        ...adminThemesVip,
                        [item.id]: { isPro: nextPro, isVip: nextVip }
                      });
                    };

                    return (
                      <div key={item.id} className="bg-neutral-800/60 p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-neutral-100">{item.name}</span>
                            {isVip ? (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-yellow-500 text-stone-950 rounded-full">VIP</span>
                            ) : isPro ? (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-blue-500 text-white rounded-full">PRO</span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-stone-700 text-stone-300 rounded-full">FREE</span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1">{item.desc}</div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Checkbox PRO */}
                          <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 select-none transition-colors">
                            <input 
                              type="checkbox" 
                              checked={isPro}
                              onChange={(e) => handleProChange(e.target.checked)}
                              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 bg-neutral-950 border-white/20 cursor-pointer"
                            />
                            <span className="text-xs text-blue-400 font-extrabold tracking-wider">PRO</span>
                          </label>

                          {/* Checkbox VIP */}
                          <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 select-none transition-colors">
                            <input 
                              type="checkbox" 
                              checked={isVip}
                              onChange={(e) => handleVipChange(e.target.checked)}
                              className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 bg-neutral-950 border-white/20 cursor-pointer"
                            />
                            <span className="text-xs text-yellow-400 font-extrabold tracking-wider">VIP</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        ) : activeTab === 'templates' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Quản lý Chủ Đề Bài Hát
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">Đổi tên hiển thị cho các chủ đề bài hát (Templates) và dịch tự động.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTranslateTemplates}
                    disabled={isTranslatingTemplates || isSavingLanding}
                    className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-purple-300 border border-purple-500/20 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-purple-400" />
                    {isTranslatingTemplates ? 'Đang dịch...' : 'Dịch tên chủ đề (AI)'}
                  </button>
                  <button
                    onClick={() => handleSaveLandingConfig()}
                    disabled={isSavingLanding || isTranslatingTemplates}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingLanding ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
              {landingSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{landingSuccessMsg}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-4">
                  Danh sách Chủ đề Bài hát (Templates 1 - 18)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({length: 18}).map((_, i) => {
                  const id = String(i + 1);
                  return (
                    <div key={id} className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">
                      
                      <label className="block text-xs font-bold text-neutral-400 mb-2 flex items-center justify-between">
                        <span>Chủ đề #{id} - {templateNames[id] || DEFAULT_TEMPLATE_NAMES[id]}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!templateVip[id]}
                            onChange={(e) => setTemplateVip({...templateVip, [id]: e.target.checked})}
                            className="w-3 h-3 text-yellow-500 rounded focus:ring-yellow-500 bg-neutral-900 border-white/10"
                          />
                          <span className="text-[10px] text-yellow-500 font-bold">VIP</span>
                        </label>
                      </label>

                      <input 
                        value={templateNames[id] || ''} 
                        onChange={(e) => setTemplateNames({...templateNames, [id]: e.target.value})} 
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" 
                        placeholder={DEFAULT_TEMPLATE_NAMES[id] || `Tên chủ đề ${id}`} 
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 border-t border-white/5 pt-8">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  Cấu hình Bài Hát Mẫu (Demo)
                </h3>
                <p className="text-sm text-neutral-400 mb-6">Thông tin này sẽ được hiển thị khi người dùng xem trước giao diện chưa có dữ liệu thực tế.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">Tên bài hát mẫu</label>
                      <input value={demoSongTitle} onChange={e => setDemoSongTitle(e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="VD: Bài Hát Mẫu Demo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">Tên tác giả / Nghệ sĩ mẫu</label>
                      <input value={demoSongArtist} onChange={e => setDemoSongArtist(e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="VD: Admin" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2">Lời bài hát mẫu (Lyrics)</label>
                    <textarea value={demoSongLyrics} onChange={e => setDemoSongLyrics(e.target.value)} rows={12} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono" placeholder="Nhập lời bài hát mẫu có kèm tag [Verse 1], [Chorus]..."></textarea>
                  </div>
                </div>
              </div>
          </div>
        ) : activeTab === 'faq' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  Quản lý FAQ & Điều khoản sử dụng
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Thiết lập câu hỏi thường gặp và quy định sử dụng dịch vụ của hệ thống.</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4.5 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-400 font-bold mb-1">CHÚ TRỌNG VẤN ĐỀ BẢN QUYỀN & CHÍNH TRỊ:</strong>
                Nội dung điều khoản phải ghi rõ uploader hoàn toàn chịu trách nhiệm về bản quyền tác phẩm đã đăng tải. Nghiêm cấm mọi hình thức đăng tải thông tin tiêu cực, chống phá đảng và nhà nước, xuyên tạc chính trị hoặc vi phạm thuần phong mỹ tục.
              </div>
            </div>

            <form onSubmit={handleAddOrEditFaq} className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-purple-300">
                {editingFaqIdx !== null ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Câu hỏi (Q)</label>
                  <input
                    type="text"
                    required
                    value={faqQ}
                    onChange={(e) => setFaqQ(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ví dụ: Quy định về bản quyền trên Chorus.vn là gì?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Câu trả lời (A)</label>
                  <textarea
                    required
                    rows={3}
                    value={faqA}
                    onChange={(e) => setFaqA(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Nêu rõ quy định uploader chịu toàn bộ trách nhiệm..."
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {editingFaqIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqIdx(null);
                      setFaqQ('');
                      setFaqA('');
                    }}
                    className="bg-neutral-800 text-neutral-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingFaqIdx !== null ? 'Cập nhật' : 'Thêm vào danh sách'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-neutral-300 px-1">Danh sách câu hỏi ({faqs.length})</h3>
              {faqs.length === 0 ? (
                <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-8 text-center text-neutral-500 text-xs">
                  Chưa có nội dung FAQ nào được cấu hình. Các mục mặc định quy định uploader chịu trách nhiệm và bản quyền sẽ tự động hiển thị ở Trang chủ nếu để trống.
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((f: any, idx: number) => (
                    <div key={`l3129-idx-${idx}`} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="text-purple-400 font-mono">Q:</span> {f.q}
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed pl-5 whitespace-pre-wrap">
                          <span className="text-neutral-500 font-bold font-mono">A:</span> {f.a}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingFaqIdx(idx);
                            setFaqQ(f.q);
                            setFaqA(f.a);
                          }}
                          className="p-2 bg-neutral-800/60 hover:bg-neutral-700/60 text-purple-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(idx)}
                          className="p-2 bg-neutral-800/60 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'keywords' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  Mục từ khóa bị cấm
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Quản lý các từ ngữ nhạy cảm. Hệ thống sẽ tự động làm mờ các từ khóa này trong Lyrics của thành viên.</p>
              </div>
            </div>

            <form onSubmit={handleAddKeyword} className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-purple-300">Thêm từ khóa mới</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ví dụ: bạo lực, chính trị, vi-phạm"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm từ khóa
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                * Từ khóa sẽ được phân tách tự động và chuẩn hóa viết thường để khớp chính xác không phân biệt hoa thường.
              </p>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-neutral-300 px-1">Tất cả từ khóa ({keywords.length})</h3>
              {keywords.length === 0 ? (
                <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-8 text-center text-neutral-500 text-xs">
                  Chưa có từ khóa bị cấm nào. Vui lòng thêm từ khóa để kích hoạt tính năng kiểm duyệt tự động.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 bg-black/20 border border-white/5 rounded-2xl p-5">
                  {keywords.map((kw: string, idx: number) => (
                    <span
                      key={`l3209-idx-${idx}`}
                      className="inline-flex items-center gap-1.5 bg-neutral-800 border border-white/5 text-white pl-3.5 pr-2.5 py-1.5 rounded-full text-xs font-bold shadow-sm hover:border-rose-500/30 hover:bg-rose-950/20 group transition-all"
                    >
                      <span className="font-mono">{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(kw)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 rounded-full hover:bg-neutral-700/50 transition-colors cursor-pointer"
                        title="Xóa từ khóa này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'content' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-purple-400" />
                  Quản lý nội dung & Kiểm duyệt demo
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Danh sách các demo chứa từ khóa bị cấm tự động phát hiện trên toàn hệ thống.</p>
              </div>
              <button
                onClick={fetchFlaggedSongs}
                disabled={loadingFlagged}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 h-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFlagged ? 'animate-spin' : ''}`} />
                Làm mới danh sách
              </button>
            </div>

            {loadingFlagged ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-xs text-neutral-400">Đang rà soát toàn bộ tác phẩm trên hệ thống...</p>
              </div>
            ) : flaggedSongs.length === 0 ? (
              <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-12 text-center text-neutral-500 text-xs flex flex-col items-center justify-center gap-3">
                <Check className="w-10 h-10 text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full" />
                <span>Không phát hiện bài hát vi phạm từ khóa nào trên hệ thống!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedSongs.map((song: any, idx: number) => (
                  <div key={`l3260-idx-${idx}`} className="bg-neutral-900/40 border border-rose-500/15 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
                          <span className="text-white">{song.title}</span>
                          <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-black">
                            Vi phạm từ khóa
                          </span>
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1">
                          Nghệ sĩ sở hữu: <strong className="text-white">{song.artistName}</strong> (@{song.username})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSong(song);
                            setEditSongTitle(song.title);
                            setEditSongLyrics(song.lyrics || '');
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Sửa bài hát
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song)}
                          className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/15 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ bài hát
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Từ khóa bị dính:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {song.matchingKeywords.map((kw: string, i: number) => (
                          <span key={`l3300-i-${i}`} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 font-mono line-clamp-2 bg-black/10 rounded-lg p-2.5">
                      {song.lyrics || "(Không có lời bài hát)"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSong && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setEditingSong(null)}
                    className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-purple-400" /> Chỉnh sửa bài hát vi phạm
                  </h3>
                  <form onSubmit={handleUpdateSong} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tiêu đề bài hát *</label>
                      <input
                        type="text"
                        required
                        value={editSongTitle}
                        onChange={(e) => setEditSongTitle(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Lời bài hát (Lyrics) *</label>
                      <textarea
                        required
                        rows={10}
                        value={editSongLyrics}
                        onChange={(e) => setEditSongLyrics(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submittingSongEdit}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer flex items-center gap-2"
                      >
                        {submittingSongEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        
        ) : activeTab === 'vouchers' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" /> Quản lý Voucher
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Tạo và quản lý các mã quà tặng</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch('/api/acp/vouchers/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ 
                    code: (document.getElementById('new-voucher-code') as HTMLInputElement).value,
                    increaseSongs: (document.getElementById('new-voucher-songs') as HTMLInputElement).value,
                    increaseTemplates: (document.getElementById('new-voucher-templates') as HTMLInputElement).value,
                    vipMonths: (document.getElementById('new-voucher-vip') as HTMLInputElement).value,
                    discountPercent: (document.getElementById('new-voucher-discount') as HTMLInputElement).value
                  })
                });
                if (res.ok) {
                  const newVoucher = await res.json();
                  setVouchers(prev => [...prev, newVoucher]);
                  (document.getElementById('new-voucher-code') as HTMLInputElement).value = '';
                  (document.getElementById('new-voucher-songs') as HTMLInputElement).value = '0';
                  (document.getElementById('new-voucher-templates') as HTMLInputElement).value = '0';
                  (document.getElementById('new-voucher-vip') as HTMLInputElement).value = '0';
                  (document.getElementById('new-voucher-discount') as HTMLInputElement).value = '0';
                } else {
                  const data = await res.json();
                  alert(data.error || 'Lỗi');
                }
              } catch(err) {
                alert('Lỗi');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mã Voucher *</label>
                  <input type="text" id="new-voucher-code" required placeholder="Nhập mã..." className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng số bài</label>
                  <input type="number" id="new-voucher-songs" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng Giao diện</label>
                  <input type="number" id="new-voucher-templates" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tháng VIP</label>
                  <input type="number" id="new-voucher-vip" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Giảm % Bill</label>
                  <input type="number" id="new-voucher-discount" defaultValue="0" min="0" max="100" placeholder="VD: 10, 20..." className="w-full bg-black/40 text-white border border-emerald-500/40 px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl cursor-pointer">Thêm Voucher</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-neutral-900/50">
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Mã Voucher</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Quyền lợi / Ưu đãi</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Số lần SD</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Ngày tạo</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold text-right pr-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers?.map((v, idx) => (
                    <tr key={`${v.id || ''}-${idx}`} className="border-b border-white/5">
                      <td className="p-4 text-sm font-mono text-purple-400">{v.code}</td>
                      <td className="p-4 text-sm text-neutral-300">
                        {v.increaseSongs > 0 && <span className="block text-xs">+ {v.increaseSongs} bài</span>}
                        {v.increaseTemplates > 0 && <span className="block text-xs">+ {v.increaseTemplates} giao diện</span>}
                        {v.vipMonths > 0 && <span className="block text-xs">+ {v.vipMonths} tháng VIP</span>}
                        {v.discountPercent > 0 && <span className="inline-block mt-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">Giảm {v.discountPercent}% tổng bill</span>}
                        {!v.increaseSongs && !v.increaseTemplates && !v.vipMonths && !v.discountPercent && <span className="text-neutral-500 text-xs">Mã thông thường</span>}
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{v.usedBy?.length || 0} lần</td>
                      <td className="p-4 text-sm text-neutral-400">{new Date(v.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right pr-6">
                        <button onClick={async () => {
                          if (confirm('Xóa mã này?')) {
                            const res = await fetch('/api/acp/vouchers/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ id: v.id })
                            });
                            if (res.ok) setVouchers(prev => prev.filter(x => x.id !== v.id));
                          }
                        }} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {(!vouchers || vouchers.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">Chưa có voucher nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'edit_item' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-neutral-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <Edit2 className="w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black text-white">Chỉnh Sửa Bài Hát / Playlist Của Mọi Nghệ Sĩ</h2>
              </div>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                Master chỉ cần dán đường link bài hát hoặc playlist của bất kỳ nghệ sĩ nào (ví dụ: <code className="bg-white/10 px-2 py-0.5 rounded text-purple-300">https://acxuantai.chorus.vn/song/vi-em-chua-bao-gio-khoc</code> hoặc <code className="bg-white/10 px-2 py-0.5 rounded text-purple-300">https://thong.chorus.vn/playlist/1785496364457</code>) hoặc nhập ID/Tiêu đề. Hệ thống sẽ tự động nhận diện và chuyển sang trang chỉnh sửa tương ứng.
              </p>

              <form onSubmit={handleLookupSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={editLookupQuery}
                    onChange={(e) => setEditLookupQuery(e.target.value)}
                    placeholder="Dán link bài hát / playlist hoặc nhập ID / Tiêu đề..."
                    className="w-full bg-neutral-950 border border-white/15 rounded-2xl pl-4 pr-32 py-4 text-sm font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-inner transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {detectedType && (
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                        detectedType === 'playlist' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {detectedType === 'playlist' ? '📜 Playlist' : '🎵 Bài Hát'}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isLookingUp}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isLookingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>OK</span>
                    </button>
                  </div>
                </div>
              </form>

              {lookupError && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {editSuccessMsg && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{editSuccessMsg}</span>
                  </div>
                </div>
              )}

              {lookupResult && lookupResult.type === 'song' && (
                <form onSubmit={handleSaveSong} className="mt-6 space-y-8 border-t border-white/10 pt-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-500/30 p-5 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-4">
                      {editSongForm.coverUrl ? (
                        <img src={editSongForm.coverUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-md shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                          <Music className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-500/40">
                            Giao diện chỉnh sửa Master
                          </span>
                          <span className="text-xs text-neutral-400 font-medium">
                            Nghệ sĩ: <strong className="text-white font-bold">{lookupResult.artistName}</strong> (<code className="text-purple-300">@{lookupResult.artistExtension}</code>)
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white mt-1">{editSongForm.title || lookupResult.title}</h3>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs px-7 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSavingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi Bài Hát'}</span>
                    </button>
                  </div>

                  {/* Audio Preview Player */}
                  {editSongForm.audioUrl && (
                    <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Nghe thử File Âm Thanh</p>
                          <p className="text-[11px] text-neutral-400 truncate max-w-xs">{editSongForm.audioUrl}</p>
                        </div>
                      </div>
                      <audio controls src={editSongForm.audioUrl} className="w-full sm:w-64 h-9 rounded-lg" />
                    </div>
                  )}

                  {/* 1. Basic Info Section */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Music className="w-4 h-4" /> 1. Thông Tin Cơ Bản Bài Hát
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Tên bài hát *</label>
                        <input
                          type="text"
                          required
                          value={editSongForm.title}
                          onChange={(e) => setEditSongForm({ ...editSongForm, title: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Link tùy chỉnh (Slug)</label>
                        <input
                          type="text"
                          value={editSongForm.slug}
                          onChange={(e) => setEditSongForm({ ...editSongForm, slug: e.target.value })}
                          placeholder="VD: vi-em-chua-bao-gio-khoc"
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Sáng tác (Composer)</label>
                        <input
                          type="text"
                          value={editSongForm.composer}
                          onChange={(e) => setEditSongForm({ ...editSongForm, composer: e.target.value })}
                          placeholder={lookupResult.artistName}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Hòa âm / Phối khí (Producer)</label>
                        <input
                          type="text"
                          value={editSongForm.musicProducer}
                          onChange={(e) => setEditSongForm({ ...editSongForm, musicProducer: e.target.value })}
                          placeholder={lookupResult.artistName}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Ca sĩ trình bày (Singer)</label>
                        <input
                          type="text"
                          value={editSongForm.singer}
                          onChange={(e) => setEditSongForm({ ...editSongForm, singer: e.target.value })}
                          placeholder={lookupResult.artistName}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Năm phát hành</label>
                        <input
                          type="text"
                          value={editSongForm.releaseYear}
                          onChange={(e) => setEditSongForm({ ...editSongForm, releaseYear: e.target.value })}
                          placeholder="VD: 2024"
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Media Files Upload */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Image className="w-4 h-4" /> 2. File Nhạc & Hình Ảnh
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-300">File Audio (MP3/WAV)</label>
                        <input
                          type="text"
                          value={editSongForm.audioUrl}
                          onChange={(e) => setEditSongForm({ ...editSongForm, audioUrl: e.target.value })}
                          placeholder="Dán URL File Audio..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audioUrl')}
                            className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-300">Ảnh Bìa (Cover Image)</label>
                        {editSongForm.coverUrl && (
                          <img src={editSongForm.coverUrl} alt="" className="w-full h-24 rounded-xl object-cover border border-white/10 mb-2" />
                        )}
                        <input
                          type="text"
                          value={editSongForm.coverUrl}
                          onChange={(e) => setEditSongForm({ ...editSongForm, coverUrl: e.target.value })}
                          placeholder="Dán URL Ảnh Bìa..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'coverUrl')}
                          className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-300">Ảnh Nền (Background Image)</label>
                        {editSongForm.bgUrl && (
                          <img src={editSongForm.bgUrl} alt="" className="w-full h-24 rounded-xl object-cover border border-white/10 mb-2" />
                        )}
                        <input
                          type="text"
                          value={editSongForm.bgUrl}
                          onChange={(e) => setEditSongForm({ ...editSongForm, bgUrl: e.target.value })}
                          placeholder="Dán URL Ảnh Nền..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bgUrl')}
                          className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Lyrics Section */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> 3. Lời Bài Hát (Lyrics)
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['Intro', 'Verse 1', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Outro', 'Drop'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setEditSongForm((prev: any) => ({
                                ...prev,
                                lyrics: (prev.lyrics ? prev.lyrics + '\n\n' : '') + `[${tag}]\n`
                              }));
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-500/30 transition-all cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={9}
                      value={editSongForm.lyrics}
                      onChange={(e) => setEditSongForm({ ...editSongForm, lyrics: e.target.value })}
                      placeholder="Dán hoặc nhập lời bài hát tại đây..."
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  {/* 4. Template Selector Cards */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Layout className="w-4 h-4" /> 4. Chọn Giao Diện Bài Hát (Template)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { id: '1', name: 'Vui vẻ', desc: 'Ấm áp', color: 'from-amber-500 to-orange-600' },
                        { id: '2', name: 'Căng Cực', desc: 'Sôi động', color: 'from-red-600 to-rose-700' },
                        { id: '3', name: 'Buồn', desc: 'Sâu lắng', color: 'from-blue-600 to-indigo-800' },
                        { id: '4', name: 'Thư giãn', desc: 'Nhẹ nhàng', color: 'from-emerald-500 to-teal-700' },
                        { id: '5', name: 'Đáng yêu', desc: 'Đỏ nhảy múa', color: 'from-pink-500 to-rose-600' },
                        { id: '6', name: 'Hạnh Phúc', desc: 'Hồng hoa rơi', color: 'from-purple-500 to-fuchsia-600' }
                      ].map((tCard) => {
                        const isSelected = String(editSongForm.template) === String(tCard.id);
                        return (
                          <button
                            key={tCard.id}
                            type="button"
                            onClick={() => setEditSongForm({ ...editSongForm, template: tCard.id })}
                            className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-purple-900/40 border-purple-500 text-white shadow-lg ring-2 ring-purple-500/40' 
                                : 'bg-neutral-900/80 border-white/10 text-neutral-400 hover:bg-neutral-900 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${tCard.color} mb-2.5 shadow-inner opacity-80`}></div>
                            <p className="text-xs font-bold text-white truncate">Mẫu {tCard.id}: {tCard.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{tCard.desc}</p>
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Status & Security */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> 5. Cài Đặt Trạng Thái & Bảo Mật
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Trạng thái phát hành</label>
                        <select
                          value={editSongForm.status}
                          onChange={(e) => setEditSongForm({ ...editSongForm, status: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="public">🌐 Công khai (Public)</option>
                          <option value="hidden">🔒 Ẩn (Hidden)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Mật khẩu bảo vệ bài hát</label>
                        <input
                          type="text"
                          value={editSongForm.password}
                          onChange={(e) => setEditSongForm({ ...editSongForm, password: e.target.value })}
                          placeholder="Để trống nếu không cài mật khẩu"
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">Loại đường link</label>
                        <select
                          value={editSongForm.linkType}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkType: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="direct">Direct Link (Trực tiếp)</option>
                          <option value="indirect">Indirect Bio Link (Gián tiếp)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 6. Streaming Links */}
                  <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> 6. Link Nhạc Số Nền Tảng Khác
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-400 mb-1">Zing MP3</label>
                        <input
                          type="text"
                          value={editSongForm.linkZing}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkZing: e.target.value })}
                          placeholder="https://zingmp3.vn/bai-hat/..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-400 mb-1">Spotify</label>
                        <input
                          type="text"
                          value={editSongForm.linkSpotify}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkSpotify: e.target.value })}
                          placeholder="https://open.spotify.com/track/..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-400 mb-1">Apple Music</label>
                        <input
                          type="text"
                          value={editSongForm.linkApple}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkApple: e.target.value })}
                          placeholder="https://music.apple.com/..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-400 mb-1">YouTube Music</label>
                        <input
                          type="text"
                          value={editSongForm.linkYoutubeMusic}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkYoutubeMusic: e.target.value })}
                          placeholder="https://music.youtube.com/watch?v=..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[11px] font-bold text-neutral-400 mb-1">YouTube Video / MV</label>
                        <input
                          type="text"
                          value={editSongForm.linkYoutube}
                          onChange={(e) => setEditSongForm({ ...editSongForm, linkYoutube: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer Save Bar */}
                  <div className="sticky bottom-4 bg-neutral-900/90 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center justify-between shadow-2xl z-20">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-300 font-medium">Chỉnh sửa bài hát: <strong className="text-white">{editSongForm.title}</strong></span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSavingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi Bài Hát'}</span>
                    </button>
                  </div>
                </form>
              )}
              {lookupResult && lookupResult.type === 'playlist' && (
                <form onSubmit={handleSavePlaylist} className="mt-6 space-y-6 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {editPlaylistForm.coverUrl ? (
                        <img src={editPlaylistForm.coverUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-900/40 flex items-center justify-center text-amber-300">
                          <Disc3 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">
                            Chỉnh Sửa Playlist (Master)
                          </span>
                          <span className="text-xs text-neutral-400">Nghệ sĩ: <strong className="text-white">{lookupResult.artistName}</strong> (<code className="text-amber-300">{lookupResult.artistExtension}</code>)</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{editPlaylistForm.title || lookupResult.title}</h3>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSavingEdit ? 'Đang Lưu...' : 'Lưu Playlist'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">Tên Playlist *</label>
                      <input
                        type="text"
                        required
                        value={editPlaylistForm.title}
                        onChange={(e) => setEditPlaylistForm({ ...editPlaylistForm, title: e.target.value })}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">Trạng Thái Hiển Thị *</label>
                      <select
                        value={editPlaylistForm.isDraft ? 'true' : 'false'}
                        onChange={(e) => {
                          const isDraftVal = e.target.value === 'true';
                          setEditPlaylistForm({
                            ...editPlaylistForm,
                            isDraft: isDraftVal,
                            password: isDraftVal ? editPlaylistForm.password : ''
                          });
                        }}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                      >
                        <option value="false">🌐 Công khai (Hiện ở trang chủ nghệ sĩ)</option>
                        <option value="true">🔒 Ẩn / Riêng tư (Bản nháp - Chỉ mở bằng link/mật khẩu)</option>
                      </select>
                    </div>
                  </div>

                  {editPlaylistForm.isDraft && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">Mật Khẩu Playlist (Tùy chọn)</label>
                        <input
                          type="text"
                          value={editPlaylistForm.password}
                          onChange={(e) => setEditPlaylistForm({ ...editPlaylistForm, password: e.target.value })}
                          placeholder="Để trống = Không có mật khẩu"
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">Secret Link (Link Bí Mật)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                              setEditPlaylistForm({ ...editPlaylistForm, secretLink: newSecret });
                            }}
                            className="text-[10px] bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                          >
                            ⚡ Tạo Link Mới
                          </button>
                        </div>
                        {editPlaylistForm.secretLink ? (
                          <div className="flex items-center gap-2">
                            <input
                              readOnly
                              value={editPlaylistForm.secretLink}
                              className="flex-1 bg-neutral-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setEditPlaylistForm({ ...editPlaylistForm, secretLink: '' })}
                              className="text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-3 py-2 rounded-xl font-bold transition-colors cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400 italic py-2">Chưa tạo Secret Link cho Playlist này.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">Ảnh bìa Playlist (Cover Image)</label>
                    <input
                      type="text"
                      value={editPlaylistForm.coverUrl}
                      onChange={(e) => setEditPlaylistForm({ ...editPlaylistForm, coverUrl: e.target.value })}
                      placeholder="Link Ảnh bìa URL..."
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-2 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'playlistCoverUrl')}
                      className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">Mô tả Playlist</label>
                    <textarea
                      rows={3}
                      value={editPlaylistForm.description}
                      onChange={(e) => setEditPlaylistForm({ ...editPlaylistForm, description: e.target.value })}
                      placeholder="Mô tả danh sách phát..."
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
                      Chọn bài hát đưa vào Playlist ({editPlaylistForm.demoIds?.length || 0} bài đã chọn)
                    </label>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border border-white/10 rounded-xl p-3 bg-neutral-950">
                      {editPlaylistForm.availableDemos?.map((demo: any) => {
                        const isChecked = (editPlaylistForm.demoIds || []).includes(String(demo.id));
                        return (
                          <label
                            key={demo.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                              isChecked ? 'bg-amber-500/20 border-amber-500/40 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const demoIdStr = String(demo.id);
                                  setEditPlaylistForm((prev: any) => {
                                    const current = prev.demoIds || [];
                                    const next = e.target.checked
                                      ? [...current, demoIdStr]
                                      : current.filter((id: string) => String(id) !== demoIdStr);
                                    return { ...prev, demoIds: next };
                                  });
                                }}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                              <span className="text-xs font-semibold truncate">{demo.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                               <button
                                 type="button"
                                 onClick={async (e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   setEditLookupQuery(String(demo.id));
                                   setIsLookingUp(true);
                                   setLookupError('');
                                   setLookupResult(null);
                                   try {
                                     const res = await fetch(`/api/acp/lookup-item?query=${encodeURIComponent(String(demo.id))}`, {
                                       headers: { 'Authorization': `Bearer ${token || ''}` }
                                     });
                                     const data = await res.json();
                                     if (res.ok && data.type === 'song') {
                                       setLookupResult(data);
                                       setEditSongForm({
                                         title: data.title || '',
                                         slug: data.slug || '',
                                         composer: data.composer || '',
                                         musicProducer: data.musicProducer || '',
                                         singer: data.singer || '',
                                         releaseYear: data.releaseYear || '',
                                         lyrics: data.lyrics || '',
                                         audioUrl: data.audioUrl || '',
                                         coverUrl: data.coverUrl || '',
                                         bgUrl: data.bgUrl || '',
                                         template: data.template || '1',
                                         status: data.status || 'public',
                                         password: data.password || '',
                                         linkType: data.linkType || 'direct',
                                         linkZing: data.linkZing || '',
                                         linkSpotify: data.linkSpotify || '',
                                         linkApple: data.linkApple || '',
                                         linkYoutubeMusic: data.linkYoutubeMusic || '',
                                         linkYoutube: data.linkYoutube || ''
                                       });
                                     }
                                   } catch (err: any) {
                                     setLookupError(err.message || 'Lỗi tìm kiếm');
                                   } finally {
                                     setIsLookingUp(false);
                                   }
                                 }}
                                 className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors"
                                 title="Chỉnh sửa bài hát này (Master ACP)"
                               >
                                 <Edit3 className="w-3.5 h-3.5" />
                               </button>
                               <span className="text-[10px] text-neutral-500 font-mono">ID: {demo.id}</span>
                             </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-white/10 pt-4">
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSavingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi Playlist'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : activeTab === 'pricing' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Cài Đặt Bảng Giá Cước (FREE - PRO - VIP)
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Cấu hình giá niêm yết & giá khuyến mãi cho chu kỳ Hàng Tháng và Theo Năm</p>
              </div>
              <button
                type="button"
                disabled={pricingSaving}
                onClick={async () => {
                  setPricingSaving(true);
                  setPricingMsg({ type: '', text: '' });
                  try {
                    const res = await fetch('/api/acp/pricing', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(pricingSettings)
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setPricingMsg({ type: 'success', text: 'Đã lưu cài đặt bảng giá thành công!' });
                    } else {
                      setPricingMsg({ type: 'error', text: data.error || 'Có lỗi xảy ra khi lưu bảng giá' });
                    }
                  } catch (e) {
                    setPricingMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
                  } finally {
                    setPricingSaving(false);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" /> {pricingSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Bảng Giá'}
              </button>
            </div>

            {pricingMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold ${pricingMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {pricingMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['free', 'pro', 'vip'].map((tierKey) => {
                const tierData = pricingSettings[tierKey] || {};
                const mOrig = Number(tierData.monthlyOriginalPrice || 0);
                const mSale = Number(tierData.monthlySalePrice || 0);
                const yOrig = Number(tierData.yearlyOriginalPrice || 0);
                const ySale = Number(tierData.yearlySalePrice || 0);
                const mAnn = mSale * 12;
                const savingsPct = mAnn > 0 && ySale > 0 ? Math.max(0, Math.round((1 - ySale / mAnn) * 100)) : 0;

                return (
                  <div key={`acp-pricing-${tierKey}`} className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-5 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        tierKey === 'vip' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        tierKey === 'pro' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        GÓI {tierKey.toUpperCase()}
                      </span>
                      {savingsPct > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          Tiết kiệm {savingsPct}% năm
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black uppercase tracking-wider text-white">
                      {tierKey === 'free' ? 'Gói Miễn Phí' : tierKey === 'pro' ? 'Gói Pro' : 'Gói VIP'}
                    </h3>

                    {/* HÀNG THÁNG */}
                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Chu Kỳ Hàng Tháng (Monthly)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Giá Trước KM (đ)</label>
                          <input
                            type="number"
                            value={tierData.monthlyOriginalPrice || 0}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setPricingSettings((prev: any) => ({
                                ...prev,
                                [tierKey]: { ...prev[tierKey], monthlyOriginalPrice: val }
                              }));
                            }}
                            className="w-full bg-black/60 text-white border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">Giá Khuyến Mãi (đ)</label>
                          <input
                            type="number"
                            value={tierData.monthlySalePrice || 0}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setPricingSettings((prev: any) => ({
                                ...prev,
                                [tierKey]: { ...prev[tierKey], monthlySalePrice: val }
                              }));
                            }}
                            className="w-full bg-black/60 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* THEO NĂM */}
                    <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Chu Kỳ Theo Năm (Yearly)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Giá Trước KM (đ)</label>
                          <input
                            type="number"
                            value={tierData.yearlyOriginalPrice || 0}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setPricingSettings((prev: any) => ({
                                ...prev,
                                [tierKey]: { ...prev[tierKey], yearlyOriginalPrice: val }
                              }));
                            }}
                            className="w-full bg-black/60 text-white border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">Giá Khuyến Mãi (đ)</label>
                          <input
                            type="number"
                            value={tierData.yearlySalePrice || 0}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setPricingSettings((prev: any) => ({
                                ...prev,
                                [tierKey]: { ...prev[tierKey], yearlySalePrice: val }
                              }));
                            }}
                            className="w-full bg-black/60 text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'roles' ? (

          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Phân Quyền Tính Năng Cho 3 Gói (Free - Pro - VIP)
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Quản lý và tích chọn các tính năng được phép truy cập cho từng gói. Danh sách này sẽ tự động hiển thị trên Bảng Giá ở Trang Chủ.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRolesMatrix(prev => [
                      ...prev,
                      { id: 'f_' + Date.now(), name: 'Tính năng mới', free: false, pro: true, vip: true, freeText: '', proText: '', vipText: '' }
                    ]);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Thêm Quyền / Tính Năng Mới
                </button>

                <button
                  type="button"
                  disabled={matrixSaving}
                  onClick={async () => {
                    setMatrixSaving(true);
                    setMatrixMsg({ type: '', text: '' });
                    try {
                      const res = await fetch('/api/acp/roles-matrix', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(rolesMatrix)
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setMatrixMsg({ type: 'success', text: 'Đã lưu cài đặt phân quyền tính năng thành công!' });
                      } else {
                        setMatrixMsg({ type: 'error', text: data.error || 'Lỗi khi lưu' });
                      }
                    } catch(e) {
                      setMatrixMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
                    } finally {
                      setMatrixSaving(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all shrink-0"
                >
                  <Save className="w-4 h-4" /> {matrixSaving ? 'Đang lưu...' : 'Lưu Phân Quyền'}
                </button>
              </div>
            </div>

            {matrixMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold ${matrixMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {matrixMsg.text}
              </div>
            )}

            <div className="space-y-4">
              {rolesMatrix.map((item, idx) => (
                <div
                  key={item.id || `rm-${idx}`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx === null || draggedIdx === idx) return;
                    setRolesMatrix(prev => {
                      const next = [...prev];
                      const [movedItem] = next.splice(draggedIdx, 1);
                      next.splice(idx, 0, movedItem);
                      return next;
                    });
                    setDraggedIdx(null);
                  }}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 relative transition-all hover:border-purple-500/30 ${
                    draggedIdx === idx ? 'opacity-40 border-purple-500 border-dashed scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0 cursor-grab active:cursor-grabbing text-neutral-500 hover:text-purple-300 transition-colors" title="Kéo thả để sắp xếp vị trí">
                        <GripVertical className="w-4 h-4" />
                        <span className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, name: val } : x));
                        }}
                        placeholder="Mô tả tính năng (vd: Trang tiểu sử Bio, Sao lưu 24/7...)"
                        className="flex-1 bg-neutral-900 text-white border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-6 shrink-0 bg-neutral-900/80 px-5 py-2.5 rounded-xl border border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-300 hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={!!item.free}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, free: checked } : x));
                          }}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                        <span>Free</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-300 hover:text-purple-200 select-none">
                        <input
                          type="checkbox"
                          checked={!!item.pro}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, pro: checked } : x));
                          }}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                        <span>Pro</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300 hover:text-amber-200 select-none">
                        <input
                          type="checkbox"
                          checked={!!item.vip}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, vip: checked } : x));
                          }}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <span>VIP</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (idx === 0) return;
                          setRolesMatrix(prev => {
                            const next = [...prev];
                            const temp = next[idx - 1];
                            next[idx - 1] = next[idx];
                            next[idx] = temp;
                            return next;
                          });
                        }}
                        disabled={idx === 0}
                        className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Di chuyển lên"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (idx === rolesMatrix.length - 1) return;
                          setRolesMatrix(prev => {
                            const next = [...prev];
                            const temp = next[idx + 1];
                            next[idx + 1] = next[idx];
                            next[idx] = temp;
                            return next;
                          });
                        }}
                        disabled={idx === rolesMatrix.length - 1}
                        className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Di chuyển xuống"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa tính năng "${item.name}" khỏi danh sách?`)) {
                            setRolesMatrix(prev => prev.filter((_, i) => i !== idx));
                          }
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Xóa tính năng này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/5 pt-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">Chữ riêng gói Free (tùy chọn)</span>
                      <input
                        type="text"
                        value={item.freeText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, freeText: val } : x));
                        }}
                        placeholder={`Mặc định: ${item.name || ''}`}
                        className="w-full bg-neutral-950/60 text-neutral-300 border border-white/5 rounded-lg px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">Chữ riêng gói Pro (tùy chọn)</span>
                      <input
                        type="text"
                        value={item.proText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, proText: val } : x));
                        }}
                        placeholder={`Mặc định: ${item.name || ''}`}
                        className="w-full bg-neutral-950/60 text-neutral-300 border border-white/5 rounded-lg px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">Chữ riêng gói VIP (tùy chọn)</span>
                      <input
                        type="text"
                        value={item.vipText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRolesMatrix(prev => prev.map((x, i) => i === idx ? { ...x, vipText: val } : x));
                        }}
                        placeholder={`Mặc định: ${item.name || ''}`}
                        className="w-full bg-neutral-950/60 text-neutral-300 border border-white/5 rounded-lg px-3 py-1.5 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {rolesMatrix.length === 0 && (
                <div className="p-8 text-center text-neutral-500 bg-black/20 rounded-2xl border border-white/5">
                  Chưa có tính năng nào. Bấm nút "Thêm Quyền / Tính Năng Mới" ở trên để khởi tạo.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'explore' ? (
          <ExploreTabContent
            token={token}
            exploreFeatures={exploreFeatures}
            setExploreFeatures={setExploreFeatures}
            exploreSaving={exploreSaving}
            setExploreSaving={setExploreSaving}
            exploreLoaded={exploreLoaded}
            setExploreLoaded={setExploreLoaded}
            exploreFileInputRefs={exploreFileInputRefs}
            showToast={(msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); }}
          />
        ) : activeTab === 'cleanup' ? (
          <CleanupTabContent token={token!} showToast={(msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); }} />
        ) : null}
      </main>

      {/* New Artist Info Modal */}
      {newArtistCreatedInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" /> Tạo nghệ sĩ thành công!
            </h3>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm text-neutral-300 relative group mb-6">
              <button 
                onClick={() => {
                  const textToCopy = `Thông tin kho nhạc nghệ sĩ ${newArtistCreatedInfo.name}
Nghệ danh: ${newArtistCreatedInfo.name}
Username: ${newArtistCreatedInfo.username}
Website: ${newArtistCreatedInfo.extension}.${getPlatformDomain()}
Admin: ${newArtistCreatedInfo.extension}.${getPlatformDomain()}/admin
Admin User: ${newArtistCreatedInfo.username}
Admin Password: ${newArtistCreatedInfo.password}`;
                  navigator.clipboard.writeText(textToCopy);
                  setToast('Đã copy thông tin!');
                  setTimeout(() => setToast(null), 3000);
                }}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Copy thông tin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              
              <div className="space-y-1.5 whitespace-pre-wrap pr-10">
                <span className="text-white font-bold block mb-3 border-b border-white/10 pb-2">Thông tin kho nhạc nghệ sĩ {newArtistCreatedInfo.name}</span>
                <p>Nghệ danh: <span className="text-white">{newArtistCreatedInfo.name}</span></p>
                <p>Username: <span className="text-white">{newArtistCreatedInfo.username}</span></p>
                <p>Website: <span className="text-emerald-400">{newArtistCreatedInfo.extension}.{getPlatformDomain()}</span></p>
                <p>Admin: <span className="text-emerald-400">{newArtistCreatedInfo.extension}.{getPlatformDomain()}/admin</span></p>
                <p>Admin User: <span className="text-white">{newArtistCreatedInfo.username}</span></p>
                <p>Admin Password: <span className="text-white">{newArtistCreatedInfo.password}</span></p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setNewArtistCreatedInfo(null)}
                className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-sm font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" /> Thêm nghệ sĩ mới
            </h3>

            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tên Nghệ Sĩ *</label>
                <input 
                  type="text" 
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Tên Nghệ Sĩ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mô tả ngắn / Tagline (Bio) - Để trống để tự động hiển thị mặc định</label>
                <input 
                  type="text" 
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Thiên đường nhạc của..."
                />
              </div>

              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">FREE (Mặc định)</option>
                  <option value="vip" className="bg-neutral-900 text-white">VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số bài tối đa (Để trống: theo hạng)</label>
                <input 
                  type="number"
                  value={artistMaxSongs}
                  onChange={(e) => setArtistMaxSongs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Để trống sẽ áp dụng giới hạn theo Hạng thành viên"
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email (Đăng nhập & Bảo mật) *</label>
                <input 
                  type="email" 
                  required
                  value={artistEmail}
                  onChange={(e) => setArtistEmail(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: artist@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username (Đăng nhập) *</label>
                  <input 
                    type="text" 
                    required
                    value={artistUsername}
                    onChange={(e) => setArtistUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="vd: username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                  <input 
                    type="text" 
                    required
                    value={artistExtension}
                    onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="vd: tennghesi"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>{getPlatformDomain()}/{"{phần_mở_rộng}"}</strong> HOẶC cấu hình DNS trỏ subdomain <strong>{"{phần_mở_rộng}"}.{getPlatformDomain()}</strong> về IP máy chủ để dùng như trang độc lập.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username phụ / bổ sung (Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={artistExtraUsernames}
                  onChange={(e) => setArtistExtraUsernames(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="vd: tai, taicute"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Cho phép thành viên sử dụng thêm nhiều username khác nhau (ví dụ: truy cập qua <strong>tai.{getPlatformDomain()}</strong> cũng như <strong>acxuantai.{getPlatformDomain()}</strong>). Phân tách các username bằng dấu phẩy.
                </p>
              </div>

                            <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <div className="relative">
                  <input 
                    type={showModalPass ? "text" : "password"} 
                    required
                    value={artistPassword}
                    onChange={(e) => setArtistPassword(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 pr-11 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Mật khẩu"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowModalPass(!showModalPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors"
                    title={showModalPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-verified"
                    checked={artistVerified}
                    onChange={(e) => setArtistVerified(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-verified" className="text-sm font-bold select-none cursor-pointer flex items-center gap-1">
                    Đã xác thực (Tích xanh)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-public"
                    checked={artistIsPublic}
                    onChange={(e) => setArtistIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-public" className="text-sm font-bold select-none cursor-pointer">
                    Trang chủ
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-special"
                    checked={artistIsSpecial}
                    onChange={(e) => setArtistIsSpecial(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded border-white/10"
                  />
                  <label htmlFor="add-special" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    V.VIP (ACP riêng)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Ngôn ngữ mặc định *</label>
                <select 
                  value={artistDefaultLanguage}
                  onChange={(e) => setArtistDefaultLanguage(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-sans"
                >
                  <option value="vi" className="bg-neutral-900">Tiếng Việt</option>
                  <option value="en" className="bg-neutral-900">English</option>
                  <option value="ko" className="bg-neutral-900">한국어</option>
                  <option value="ja" className="bg-neutral-900">日本語</option>
                  <option value="th" className="bg-neutral-900">ไทย</option>
                  <option value="zh" className="bg-neutral-900">中文</option>
                </select>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-has-external"
                    checked={artistHasExternalWebsite}
                    onChange={(e) => setArtistHasExternalWebsite(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-has-external" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Nghệ sĩ đã có Website riêng
                  </label>
                </div>
                {artistHasExternalWebsite && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Đường dẫn Website riêng
                    </label>
                    <input 
                      type="text"
                      value={artistExternalWebsiteUrl}
                      onChange={(e) => setArtistExternalWebsiteUrl(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
                      placeholder="VD: tai.com"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Hệ thống sẽ tự động đồng bộ & lấy ảnh bìa, danh sách bài hát, danh mục và số lượng bài hát từ Website này để hiển thị trực tiếp lên trang chủ.
                    </p>
                  </div>
                )}
              </div>

              {formErr && (
                <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2.5 rounded-xl px-3 border border-rose-500/15">
                  {formErr}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer"
                >
                  Tạo nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && editingArtist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => { setShowEditModal(false); setEditingArtist(null); }}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" /> Cập nhật nghệ sĩ
            </h3>
            <form onSubmit={handleUpdateArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tên Nghệ Sĩ *</label>
                <input 
                  type="text" 
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Tên Nghệ Sĩ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mô tả ngắn / Tagline (Bio) - Để trống để tự động hiển thị mặc định</label>
                <input 
                  type="text" 
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Thiên đường nhạc của..."
                />
              </div>

              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">FREE (Mặc định)</option>
                  <option value="vip" className="bg-neutral-900 text-white">VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số bài tối đa (Để trống: theo hạng)</label>
                <input 
                  type="number"
                  value={artistMaxSongs}
                  onChange={(e) => setArtistMaxSongs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Để trống sẽ áp dụng giới hạn theo Hạng thành viên"
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 opacity-50">Username (Đăng nhập) *</label>
                  <input 
                    type="text" 
                    disabled
                    readOnly
                    value={artistUsername}
                    className="w-full bg-black/20 text-neutral-400 border border-white/5 px-4 py-3 rounded-xl focus:outline-none font-mono cursor-not-allowed"
                    placeholder="vd: username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                  <input 
                    type="text" 
                    required
                    value={artistExtension}
                    onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="vd: tennghesi"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>{getPlatformDomain()}/{"{phần_mở_rộng}"}</strong> HOẶC cấu hình DNS trỏ subdomain <strong>{"{phần_mở_rộng}"}.{getPlatformDomain()}</strong> về IP máy chủ để dùng như trang độc lập.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username phụ / bổ sung (Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={artistExtraUsernames}
                  onChange={(e) => setArtistExtraUsernames(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="vd: tai, taicute"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Cho phép thành viên sử dụng thêm nhiều username khác nhau (ví dụ: truy cập qua <strong>tai.{getPlatformDomain()}</strong> cũng như <strong>acxuantai.{getPlatformDomain()}</strong>). Phân tách các username bằng dấu phẩy.
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <div className="relative">
                  <input 
                    type={showModalPass ? "text" : "password"} 
                    value={artistPassword}
                    onChange={(e) => setArtistPassword(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 pr-11 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Nhập mật khẩu mới..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowModalPass(!showModalPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 transition-colors"
                    title={showModalPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-verified"
                    checked={artistVerified}
                    onChange={(e) => setArtistVerified(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-verified" className="text-sm font-bold select-none cursor-pointer">
                    Đã xác thực (Tích xanh)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-public"
                    checked={artistIsPublic}
                    onChange={(e) => setArtistIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-public" className="text-sm font-bold select-none cursor-pointer">
                    Trang chủ
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-special"
                    checked={artistIsSpecial}
                    onChange={(e) => setArtistIsSpecial(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-special" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    V.VIP (ACP riêng)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Ngôn ngữ mặc định *</label>
                <select 
                  value={artistDefaultLanguage}
                  onChange={(e) => setArtistDefaultLanguage(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-sans"
                >
                  <option value="vi" className="bg-neutral-900">Tiếng Việt</option>
                  <option value="en" className="bg-neutral-900">English</option>
                  <option value="ko" className="bg-neutral-900">한국어</option>
                  <option value="ja" className="bg-neutral-900">日本語</option>
                  <option value="th" className="bg-neutral-900">ไทย</option>
                  <option value="zh" className="bg-neutral-900">中文</option>
                </select>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-has-external"
                    checked={artistHasExternalWebsite}
                    onChange={(e) => setArtistHasExternalWebsite(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-has-external" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Nghệ sĩ đã có Website riêng
                  </label>
                </div>
                {artistHasExternalWebsite && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Đường dẫn Website riêng
                    </label>
                    <input 
                      type="text"
                      value={artistExternalWebsiteUrl}
                      onChange={(e) => setArtistExternalWebsiteUrl(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
                      placeholder="VD: tai.com"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Hệ thống sẽ tự động đồng bộ & lấy ảnh bìa, danh sách bài hát, danh mục và số lượng bài hát từ Website này để hiển thị trực tiếp lên trang chủ.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Thông tin Database riêng (Nếu có)
                </label>
                <textarea 
                  value={artistDbConfig}
                  onChange={(e) => setArtistDbConfig(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-xs h-24"
                  placeholder='{ "apiKey": "AIza...", "projectId": "...", "storageBucket": "..." }'
                />
                {artistIsSpecial && (
                  <button
                    type="button"
                    disabled={isSyncing[artistUsername]}
                    onClick={() => handleSyncFirebaseData(artistUsername)}
                    className="mt-2 w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-850 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {isSyncing[artistUsername] ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang đồng bộ dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Đồng bộ toàn bộ dữ liệu từ Firebase cũ</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Biên dịch tự động bằng AI (Gemini)</h4>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Tự động dịch phần giới thiệu (Bio), tiêu đề trang, tên các danh mục (Tabs), và thông tin Brief/Tên thương hiệu nhạc, tên/mô tả danh sách phát sang 5 ngôn ngữ khác (Anh, Hàn, Nhật, Thái, Trung).
                      <br />
                      <span className="text-amber-350">Không biên dịch:</span> Tên bài hát, lời bài hát, tên ca sĩ và tác giả để giữ nguyên tác gốc.
                    </p>
                  </div>
                </div>
                <button
                   type="button"
                   onClick={handleAITranslateArtist}
                   disabled={isTranslatingArtist}
                   className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-850 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                   {isTranslatingArtist ? (
                     <>
                       <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Đang tiến hành dịch thuật bằng AI...</span>
                     </>
                   ) : (
                     <>
                       <Globe className="w-3.5 h-3.5" />
                       <span>Biên dịch hồ sơ nghệ sĩ này</span>
                     </>
                   )}
                </button>
              </div>

              {formErr && (
                <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2.5 rounded-xl px-3 border border-rose-500/15">
                  {formErr}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingArtist(null); }}
                  className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer"
                >
                  Cập nhật nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {actionConfirm?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-black border border-stone-150 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 font-sans">
                  {actionConfirm.title}
                </h3>
                {actionConfirm.isAlertOnly && (
                  <button 
                    onClick={() => {
                      if (actionConfirm.onCancel) actionConfirm.onCancel();
                      if (confirmResolverRef.current) {
                        confirmResolverRef.current(false);
                        confirmResolverRef.current = null;
                      }
                      setActionConfirm(null);
                    }}
                    className="text-neutral-400 hover:text-black bg-neutral-100 hover:bg-neutral-200/60 p-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{actionConfirm.message}</p>
              
              <div className="flex gap-2.5 justify-end mt-2">
                {!actionConfirm.isAlertOnly && (
                  <button 
                    onClick={() => {
                      if (actionConfirm.onCancel) actionConfirm.onCancel();
                      if (confirmResolverRef.current) {
                        confirmResolverRef.current(false);
                        confirmResolverRef.current = null;
                      }
                      setActionConfirm(null);
                    }} 
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button 
                  onClick={() => {
                    actionConfirm.onConfirm();
                    if (confirmResolverRef.current) {
                      confirmResolverRef.current(true);
                      confirmResolverRef.current = null;
                    }
                    setActionConfirm(null);
                  }} 
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg ${
                    actionConfirm.type === 'danger' || actionConfirm.type === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                  }`}
                >
                  {actionConfirm.isAlertOnly ? 'Đóng' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Mail Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] w-full max-w-6xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto shadow-2xl custom-scrollbar flex flex-col">
            <button 
              onClick={() => setShowComposeModal(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white bg-white/5 p-2 rounded-xl transition-all cursor-pointer hover:bg-white/10"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <Mail className="w-5.5 h-5.5 text-purple-400" />
                <span>Soạn Thư Hệ Thống</span>
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Gửi thông báo điện tử đến các nhóm nghệ sĩ trên hệ thống Chorus.vn.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Compose Form */}
              <div className="lg:col-span-3 bg-black/20 border border-white/5 rounded-3xl p-6">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setMailError('');
                    setMailSuccess('');
                    setMailSending(true);
                    try {
                      const res = await fetch('/api/acp/send-mail', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          recipientType: mailRecipientType,
                          registeredAfter: mailRecipientType === 'registered_after' ? mailRegisteredAfterDate : undefined,
                          title: mailTitle,
                          content: mailContent
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setMailSuccess(data.message || 'Gửi thư thành công!');
                        setMailTitle('');
                        setMailContent('');
                        fetchSentMails(); // Refresh history
                      } else {
                        setMailError(data.error || 'Có lỗi xảy ra khi gửi thư!');
                      }
                    } catch (err) {
                      setMailError('Lỗi kết nối máy chủ!');
                    } finally {
                      setMailSending(false);
                    }
                  }}
                  className="space-y-6"
                >
                  {mailSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      {mailSuccess}
                    </div>
                  )}
                  {mailError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      {mailError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Đối tượng nhận thư
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMailRecipientType('all')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'all'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Toàn bộ nghệ sĩ</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Gửi đến tất cả tài khoản nghệ sĩ</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('verified')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'verified'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Đã xác thực Email</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Chỉ nghệ sĩ đã xác minh địa chỉ email</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('unverified')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'unverified'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Chưa xác thực Email</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Nghệ sĩ đăng ký nhưng chưa xác minh email</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('registered_after')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'registered_after'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Đăng ký sau ngày</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Lọc nghệ sĩ theo mốc thời gian đăng ký</div>
                      </button>
                    </div>
                  </div>

                  {mailRecipientType === 'registered_after' && (
                    <div className="space-y-2 bg-black/20 border border-white/5 p-4 rounded-2xl">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                        Chọn ngày đăng ký sau mốc
                      </label>
                      <input
                        type="date"
                        required
                        value={mailRegisteredAfterDate}
                        onChange={(e) => setMailRegisteredAfterDate(e.target.value)}
                        className="bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-bold font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Tiêu đề thư
                    </label>
                    <input
                      type="text"
                      required
                      value={mailTitle}
                      onChange={(e) => setMailTitle(e.target.value)}
                      placeholder="Nhập tiêu đề email thông báo..."
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Nội dung thư (Hỗ trợ định dạng văn bản thường)
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={mailContent}
                      onChange={(e) => setMailContent(e.target.value)}
                      placeholder="Nhập nội dung thư gửi..."
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mailSending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-md tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {mailSending ? 'Đang gửi...' : 'GỬI THƯ HỆ THỐNG'}
                  </button>
                </form>
              </div>

              {/* Right Column: Sent Emails History */}
              <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col max-h-[650px] overflow-hidden">
                <h3 className="text-sm font-black text-neutral-200 mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span>Lịch Sử Thư Đã Gửi</span>
                  <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-neutral-400 font-mono">
                    {sentMails.length}
                  </span>
                </h3>

                {sentMails.length === 0 ? (
                  <div className="py-24 text-center text-neutral-500 flex flex-col items-center justify-center flex-grow">
                    <Database className="w-10 h-10 mb-2 opacity-10" />
                    <p className="text-xs font-bold">Chưa gửi thư nào.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto custom-scrollbar space-y-3 flex-grow pr-1">
                    {sentMails.map((mail, idx) => (
                      <div
                        key={`l4597-idx-${idx}`}
                        className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2 hover:border-pink-500/20 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                            {mail.recipientType === 'all' && 'Toàn bộ nghệ sĩ'}
                            {mail.recipientType === 'verified' && 'Đã xác thực email'}
                            {mail.recipientType === 'unverified' && 'Chưa xác thực email'}
                            {mail.recipientType === 'registered_after' && `Đăng ký sau ${mail.registeredAfter}`}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {new Date(mail.sentAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate">{mail.title}</h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed whitespace-pre-wrap font-medium">
                          {mail.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Explore Tab Content Component ──────────────────────────────────
function ExploreTabContent({ token, exploreFeatures, setExploreFeatures, exploreSaving, setExploreSaving, exploreLoaded, setExploreLoaded, exploreFileInputRefs, showToast }: {
  token: string;
  exploreFeatures: any[];
  setExploreFeatures: (f: any[]) => void;
  exploreSaving: boolean;
  setExploreSaving: (b: boolean) => void;
  exploreLoaded: boolean;
  setExploreLoaded: (b: boolean) => void;
  exploreFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  showToast: (msg: string) => void;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Load features on mount
  useEffect(() => {
    if (!exploreLoaded && token) {
      fetch('/api/public/explore-features')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setExploreFeatures(data);
          setExploreLoaded(true);
        })
        .catch(() => setExploreLoaded(true));
    }
  }, [token, exploreLoaded]);

  const addFeature = () => {
    const newFeature = {
      id: `ef_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      badge: '✦ Tính Năng',
      title: 'Tiêu đề tính năng mới',
      description: 'Mô tả chi tiết về tính năng này...',
      descriptionExtra: '',
      deviceType: 'iphone' as const,
      imageUrl: '',
      layout: 'left' as const,
      order: exploreFeatures.length,
    };
    setExploreFeatures([...exploreFeatures, newFeature]);
  };

  const updateFeature = (id: string, field: string, value: any) => {
    setExploreFeatures(exploreFeatures.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFeature = (id: string) => {
    if (!confirm('Xoá tính năng này?')) return;
    setExploreFeatures(exploreFeatures.filter(f => f.id !== id));
  };

  const moveFeature = (id: string, direction: 'up' | 'down') => {
    const idx = exploreFeatures.findIndex(f => f.id === id);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= exploreFeatures.length) return;
    const copy = [...exploreFeatures];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    copy.forEach((f, i) => f.order = i);
    setExploreFeatures(copy);
  };

  const uploadImage = async (id: string, file: File, deviceIndex?: number) => {
    setUploadingId(`${id}_${deviceIndex ?? 'main'}`);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/master/explore-features/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (deviceIndex !== undefined) {
          const feature = exploreFeatures.find(f => f.id === id);
          if (feature) {
            const currentDevices = feature.devices && feature.devices.length > 0 
              ? [...feature.devices] 
              : (feature.imageUrl ? [{ type: feature.deviceType || 'iphone', imageUrl: feature.imageUrl }] : []);
            
            if (currentDevices[deviceIndex]) {
              currentDevices[deviceIndex].imageUrl = data.url;
            } else {
              currentDevices[deviceIndex] = { type: 'iphone', imageUrl: data.url };
            }
            updateFeature(id, 'devices', currentDevices);
          }
        } else {
          updateFeature(id, 'imageUrl', data.url);
        }
        showToast('Upload ảnh thành công!');
      } else {
        alert('Upload thất bại: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Upload lỗi: ' + e.message);
    }
    setUploadingId(null);
  };

  const saveAll = async () => {
    setExploreSaving(true);
    try {
      const orderedFeatures = exploreFeatures.map((f, i) => ({ ...f, order: i }));
      const res = await fetch('/api/master/explore-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ features: orderedFeatures }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã lưu trang Khám Phá!');
      } else {
        alert('Lưu thất bại: ' + (data.error || 'Unknown'));
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
    setExploreSaving(false);
  };

  const deviceIcons: Record<string, React.ReactNode> = {
    iphone: <Smartphone className="w-4 h-4" />,
    ipad: <Tablet className="w-4 h-4" />,
    macbook: <Monitor className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              Trang Khám Phá (Features)
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              Quản lý nội dung trang <a href="/explore" target="_blank" className="text-purple-400 hover:underline">chorus.vn/explore</a> — phong cách giống remio.net/features
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/explore" target="_blank" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold">
              <Eye className="w-3.5 h-3.5" />
              Xem Trang
            </a>
            <button
              onClick={saveAll}
              disabled={exploreSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {exploreSaving ? 'Đang lưu...' : 'Lưu Tất Cả'}
            </button>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={addFeature}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/40 text-neutral-400 hover:text-purple-300 transition-all text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm Tính Năng Mới
        </button>
      </div>

      {/* Feature Cards */}
      {exploreFeatures.map((feature, idx) => (
        <div key={feature.id} className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs font-mono">#{idx + 1}</span>
              {feature.devices && feature.devices.length > 0 ? (
                feature.devices.map((dev: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                    {deviceIcons[dev.type]}
                    {dev.type}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                  {deviceIcons[feature.deviceType || 'iphone']}
                  {feature.deviceType || 'iphone'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => moveFeature(feature.id, 'up')} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all disabled:opacity-20 cursor-pointer">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => moveFeature(feature.id, 'down')} disabled={idx === exploreFeatures.length - 1} className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all disabled:opacity-20 cursor-pointer">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => removeFeature(feature.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Form fields */}
            <div className="space-y-4">
              {/* Badge */}
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Badge</label>
                <input
                  type="text"
                  value={feature.badge}
                  onChange={e => updateFeature(feature.id, 'badge', e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-purple-500/40 focus:outline-none transition-all"
                  placeholder="✦ Tốc Độ"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Tiêu đề</label>
                <textarea
                  value={feature.title}
                  onChange={e => updateFeature(feature.id, 'title', e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  placeholder="Tiêu đề lớn, bold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Mô tả</label>
                <textarea
                  value={feature.description}
                  onChange={e => updateFeature(feature.id, 'description', e.target.value)}
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  placeholder="Mô tả chi tiết..."
                />
              </div>

              {/* Description Extra */}
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Mô tả phụ (optional, nhạt hơn)</label>
                <textarea
                  value={feature.descriptionExtra || ''}
                  onChange={e => updateFeature(feature.id, 'descriptionExtra', e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 placeholder-neutral-600 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  placeholder="Thông tin bổ sung..."
                />
              </div>

              {/* Layout */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Bố cục màn hình</label>
                  <select
                    value={feature.layout}
                    onChange={e => updateFeature(feature.id, 'layout', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-purple-500/40 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="left">← Text trái, Device phải</option>
                    <option value="right">→ Text phải, Device trái</option>
                    <option value="center">↕ Canh giữa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Devices List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Các thiết bị (Tối đa 3)</label>
                {(feature.devices?.length || (feature.imageUrl ? 1 : 0)) < 3 && (
                  <button 
                    onClick={() => {
                      const currentDevices = feature.devices && feature.devices.length > 0 
                        ? [...feature.devices] 
                        : (feature.imageUrl ? [{ type: feature.deviceType || 'iphone', imageUrl: feature.imageUrl }] : []);
                      updateFeature(feature.id, 'devices', [...currentDevices, { type: 'iphone', imageUrl: '' }]);
                    }}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded"
                  >
                    + Thêm thiết bị
                  </button>
                )}
              </div>
              
              {(() => {
                const currentDevices = feature.devices && feature.devices.length > 0 
                  ? feature.devices 
                  : (feature.imageUrl ? [{ type: feature.deviceType || 'iphone', imageUrl: feature.imageUrl }] : []);
                  
                if (currentDevices.length === 0) {
                  return (
                    <div className="text-center p-6 border border-dashed border-white/10 rounded-xl">
                      <p className="text-xs text-neutral-500 mb-2">Chưa có thiết bị nào</p>
                      <button 
                        onClick={() => updateFeature(feature.id, 'devices', [{ type: 'iphone', imageUrl: '' }])}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg"
                      >
                        + Thêm thiết bị đầu tiên
                      </button>
                    </div>
                  );
                }

                return currentDevices.map((dev: any, dIndex: number) => (
                  <div key={dIndex} className="bg-black/20 border border-white/5 rounded-xl p-3 relative group/dev">
                    <button 
                      onClick={() => {
                        const newDevices = [...currentDevices];
                        newDevices.splice(dIndex, 1);
                        updateFeature(feature.id, 'devices', newDevices);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 p-1 rounded-full opacity-0 group-hover/dev:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex gap-3">
                      <div className="w-1/3">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">Loại thiết bị</label>
                        <select
                          value={dev.type}
                          onChange={e => {
                            const newDevices = [...currentDevices];
                            newDevices[dIndex].type = e.target.value;
                            updateFeature(feature.id, 'devices', newDevices);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500/40 focus:outline-none"
                        >
                          <option value="iphone">iPhone</option>
                          <option value="ipad">iPad</option>
                          <option value="macbook">MacBook</option>
                          <option value="frame">Khung ảnh trơn</option>
                        </select>
                      </div>
                      
                      <div className="w-2/3">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">Ảnh màn hình</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={dev.imageUrl || ''}
                            onChange={e => {
                              const newDevices = [...currentDevices];
                              newDevices[dIndex].imageUrl = e.target.value;
                              updateFeature(feature.id, 'devices', newDevices);
                            }}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:border-purple-500/40 focus:outline-none"
                            placeholder="URL..."
                          />
                          <button
                            onClick={() => exploreFileInputRefs.current[`${feature.id}_${dIndex}`]?.click()}
                            className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg flex items-center justify-center shrink-0"
                          >
                            {uploadingId === `${feature.id}_${dIndex}` ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </button>
                          <input
                            ref={el => { exploreFileInputRefs.current[`${feature.id}_${dIndex}`] = el; }}
                            type="file"
                            accept="image/*,video/mp4,video/quicktime"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) uploadImage(feature.id, file, dIndex);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {dev.imageUrl && (
                      <div className="mt-2 border border-white/5 rounded-lg overflow-hidden bg-black/50 p-1">
                        <img src={dev.imageUrl} className="h-20 object-contain mx-auto" />
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {exploreFeatures.length === 0 && exploreLoaded && (
        <div className="bg-neutral-900/20 border border-white/5 rounded-3xl p-12 text-center">
          <Compass className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
          <h3 className="text-lg font-bold text-neutral-400 mb-2">Chưa có tính năng nào</h3>
          <p className="text-neutral-500 text-sm mb-6">Bấm nút "Thêm Tính Năng Mới" ở trên để bắt đầu tạo trang Khám Phá.</p>
          <button
            onClick={addFeature}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm Tính Năng Đầu Tiên
          </button>
        </div>
      )}
    </div>
  );
}

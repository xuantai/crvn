sed -i -e '10395,10416c\
                            {(() => {\
                              const currentAudioUrl = uploadedAudioUrl || demo?.audioUrl || "";\
                              if (currentAudioUrl.includes("drive.google.com") || currentAudioUrl.includes("docs.google.com")) {\
                                  return (\
                                    <span className="text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl text-[11px] inline-block leading-normal">\
                                      ⚠️ Link Google Drive cũ (Hệ thống đã tắt tính năng chạy link trực tiếp, vui lòng tải file nhạc lên để phát ổn định)\
                                    </span>\
                                  );\
                              }\
                              return null;\
                            })()}' src/App.tsx

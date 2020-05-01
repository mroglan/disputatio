FilePond.registerPlugin(
	FilePondPluginImagePreview,
	FilePondPluginImageResize,
	FilePondPluginFileEncode,
)

FilePond.setOptions({
	stylePanelAspectRatio: 1/1,
	stylePanelLayout: 'circle',
	imageResizeMode: 'force',
	imageResizeTargetWidth: 100
});

FilePond.parse(document.body);